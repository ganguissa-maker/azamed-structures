// src/pages/dashboard/DashboardPharmacie.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, CheckCircle, XCircle, Package } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { STRUCTURE_THEMES } from '../../utils/structureThemes';
import api from '../../utils/api';

function showToast(msg, type = 'success') {
  const el = document.createElement('div');
  el.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-xl text-white text-sm font-semibold shadow-lg ${type === 'error' ? 'bg-red-500' : 'bg-green-500'}`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

export default function DashboardPharmacie() {
  const { user }      = useAuthStore();
  const structureId   = user?.structure?.id;
  const typeStructure = user?.structure?.typeStructure || 'PHARMACIE';
  const theme         = STRUCTURE_THEMES[typeStructure] || { couleur:'#2d6a4f', couleurClair:'#d8f3dc' };
  const qc            = useQueryClient();

  const [searchCat, setSearchCat] = useState('');
  const [searchMes, setSearchMes] = useState('');
  const [classeFilter, setClasse] = useState('');
  const [tab, setTab]             = useState('mes');
  const [editId, setEditId]       = useState(null);
  const [editPrix, setEditPrix]   = useState('');

  // Catalogue complet
  const { data: catData } = useQuery({
    queryKey: ['cat-meds', searchCat, classeFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: 200 });
      if (searchCat)    p.set('search', searchCat);
      if (classeFilter) p.set('classe', classeFilter);
      const { data } = await api.get(`/catalogue/medicaments?${p}`);
      return data;
    },
  });

  // Mes médicaments
  const { data: mesData } = useQuery({
    queryKey: ['mes-meds', structureId],
    queryFn: async () => {
      const { data } = await api.get(`/pharmacies/${structureId}/medicaments`);
      return data;
    },
    enabled: !!structureId,
  });

  const catalogue = catData?.data || [];
  const mesMeds   = mesData?.data || [];
  const mesIds    = new Set(mesMeds.map((m) => m.medicamentId));
  const classes   = [...new Set(catalogue.map((m) => m.classeTherapeutique).filter(Boolean))].sort();

  const { mutate: ajouter } = useMutation({
    mutationFn: (medicamentId) =>
      api.post(`/pharmacies/${structureId}/medicaments`, { medicamentId, enStock: true, disponible: true }),
    onSuccess: () => { qc.invalidateQueries(['mes-meds']); showToast('Médicament ajouté !'); },
    onError: (e) => showToast(e.response?.data?.error || 'Erreur', 'error'),
  });

  const { mutate: retirer } = useMutation({
    mutationFn: (id) => api.delete(`/pharmacies/${structureId}/medicaments/${id}`),
    onSuccess: () => { qc.invalidateQueries(['mes-meds']); showToast('Médicament retiré.'); },
  });

  const { mutate: updateItem } = useMutation({
    mutationFn: ({ id, data }) => api.put(`/pharmacies/${structureId}/medicaments/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['mes-meds']); setEditId(null); showToast('Mis à jour !'); },
  });

  const catGrouped = catalogue.reduce((acc, m) => {
    const k = m.classeTherapeutique || 'Autre';
    if (!acc[k]) acc[k] = [];
    acc[k].push(m); return acc;
  }, {});

  const mesFiltres = mesMeds.filter((m) =>
    !searchMes ||
    m.medicament?.nomCommercial?.toLowerCase().includes(searchMes.toLowerCase()) ||
    m.medicament?.dci?.toLowerCase().includes(searchMes.toLowerCase())
  );

  const mesGroupes = mesFiltres.reduce((acc, m) => {
    const k = m.medicament?.classeTherapeutique || 'Autre';
    if (!acc[k]) acc[k] = [];
    acc[k].push(m); return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.couleurClair }}>
          <Package size={20} style={{ color: theme.couleur }}/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Médicaments</h1>
          <p className="text-gray-500 text-sm">
            {mesMeds.length} médicament(s) · visibles sur le site public
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ k:'mes', l:'Mes médicaments' }, { k:'ajouter', l:'+ Ajouter depuis le catalogue' }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.k ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={tab === t.k ? { backgroundColor: theme.couleur } : {}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── Mes médicaments ─────────────────────────────────── */}
      {tab === 'mes' && (
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher dans mes médicaments..."
              value={searchMes} onChange={(e) => setSearchMes(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>

          {mesMeds.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-medium">Aucun médicament ajouté</p>
              <p className="text-sm mt-1">Ajoutez des médicaments depuis le catalogue AZAMED</p>
              <button onClick={() => setTab('ajouter')}
                className="mt-4 px-5 py-2 text-sm font-semibold text-white rounded-xl"
                style={{ backgroundColor: theme.couleur }}>
                Voir le catalogue →
              </button>
            </div>
          ) : (
            Object.entries(mesGroupes).map(([cls, items]) => (
              <div key={cls} className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{cls} ({items.length})</p>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {items.map((pm, i) => (
                    <div key={pm.id}
                      className={`px-4 py-3 flex items-center gap-3 flex-wrap ${i < items.length-1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900 truncate">{pm.medicament?.nomCommercial}</p>
                        <p className="text-xs text-gray-400">{pm.medicament?.dci} · {pm.medicament?.forme} · {pm.medicament?.dosage}</p>
                      </div>

                      {/* Prix éditable inline */}
                      {editId === pm.id ? (
                        <div className="flex items-center gap-2">
                          <input type="number" value={editPrix} onChange={(e) => setEditPrix(e.target.value)}
                            className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none text-center"
                            placeholder="Prix FCFA" autoFocus/>
                          <button onClick={() => updateItem({ id: pm.id, data: { prix: parseFloat(editPrix) || null } })}
                            className="text-xs px-2.5 py-1.5 text-white rounded-lg"
                            style={{ backgroundColor: theme.couleur }}>✓</button>
                          <button onClick={() => setEditId(null)}
                            className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-500 rounded-lg">✕</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditId(pm.id); setEditPrix(pm.prix?.toString() || ''); }}
                          className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0">
                          {pm.prix ? `${pm.prix.toLocaleString()} FCFA` : '+ Renseigner prix'}
                        </button>
                      )}

                      {/* Stock toggle */}
                      <button onClick={() => updateItem({ id: pm.id, data: { enStock: !pm.enStock } })}
                        className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold shrink-0 ${
                          pm.enStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'
                        }`}>
                        {pm.enStock ? <CheckCircle size={11}/> : <XCircle size={11}/>}
                        {pm.enStock ? 'En stock' : 'Rupture'}
                      </button>

                      <button onClick={() => { if(window.confirm('Retirer ce médicament ?')) retirer(pm.id); }}
                        className="p-1.5 text-red-300 hover:text-red-500 rounded-lg shrink-0">
                        <Trash2 size={14}/>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* ── Catalogue ───────────────────────────────────────── */}
      {tab === 'ajouter' && (
        <div>
          <div className="flex gap-3 mb-4 flex-wrap">
            <div className="relative flex-1 min-w-48">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="Rechercher un médicament dans le catalogue..."
                value={searchCat} onChange={(e) => setSearchCat(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <select value={classeFilter} onChange={(e) => setClasse(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">Toutes les classes</option>
              {classes.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <p className="text-sm text-gray-400 mb-4">{catalogue.length} médicaments disponibles dans le catalogue AZAMED</p>

          <div className="space-y-4">
            {Object.entries(catGrouped).map(([cls, items]) => (
              <div key={cls}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{cls} ({items.length})</p>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {items.map((med, i) => {
                    const deja = mesIds.has(med.id);
                    return (
                      <div key={med.id}
                        className={`flex items-center gap-3 px-4 py-3 ${i < items.length-1 ? 'border-b border-gray-50' : ''} ${deja ? 'bg-green-50/30' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900 truncate">{med.nomCommercial}</p>
                          <p className="text-xs text-gray-400">{med.dci} · {med.forme} · {med.dosage}</p>
                        </div>
                        <span className="text-xs text-gray-300 hidden md:block shrink-0">{med.laboratoireFabricant}</span>
                        {deja ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-semibold px-2.5 py-1.5 bg-green-100 rounded-lg shrink-0">
                            <CheckCircle size={11}/> Ajouté
                          </span>
                        ) : (
                          <button onClick={() => ajouter(med.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg shrink-0"
                            style={{ backgroundColor: theme.couleur }}>
                            <Plus size={12}/> Ajouter
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
            {catalogue.length === 0 && (
              <div className="text-center py-10 text-gray-400">
                <p>Aucun médicament dans le catalogue.</p>
                <p className="text-sm mt-1">L'admin doit charger le catalogue depuis le site admin.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
