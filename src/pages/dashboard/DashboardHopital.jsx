// src/pages/dashboard/DashboardHopital.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, CheckCircle, Building2 } from 'lucide-react';
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

const MODES = [
  { value: 'JOURS_OUVRABLES', label: 'Jours ouvrables' },
  { value: 'TOUS_LES_JOURS',  label: 'Tous les jours'  },
  { value: 'SUR_RDV',         label: 'Sur rendez-vous'  },
];

export default function DashboardHopital() {
  const { user }      = useAuthStore();
  const structureId   = user?.structure?.id;
  const typeStructure = user?.structure?.typeStructure || 'HOPITAL_PUBLIC';
  const theme         = STRUCTURE_THEMES[typeStructure] || { couleur:'#1565c0', couleurClair:'#e3f2fd' };
  const qc            = useQueryClient();

  const [searchCat, setSearchCat] = useState('');
  const [searchMes, setSearchMes] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [tab, setTab]             = useState('mes');
  const [editId, setEditId]       = useState(null);
  const [editVals, setEditVals]   = useState({ prix: '', mode: 'JOURS_OUVRABLES', info: '' });

  const label = ['CABINET_MEDICAL','CABINET_SPECIALISE'].includes(typeStructure)
    ? 'Consultations' : 'Services médicaux';

  // Catalogue services
  const { data: catData } = useQuery({
    queryKey: ['cat-services', searchCat, catFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: 200 });
      if (searchCat)  p.set('search', searchCat);
      if (catFilter)  p.set('categorie', catFilter);
      const { data } = await api.get(`/catalogue/services?${p}`);
      return data;
    },
  });

  // Mes services
  const { data: mesData } = useQuery({
    queryKey: ['mes-services', structureId],
    queryFn: async () => {
      const { data } = await api.get(`/hopitaux/${structureId}/services`);
      return data;
    },
    enabled: !!structureId,
  });

  const catalogue  = catData?.data    || [];
  const mesServices = mesData?.data   || [];
  const mesIds     = new Set(mesServices.map((s) => s.serviceId));
  const categories = [...new Set(catalogue.map((s) => s.categorie).filter(Boolean))].sort();

  const { mutate: ajouter } = useMutation({
    mutationFn: (serviceId) =>
      api.post(`/hopitaux/${structureId}/services`, { serviceId, disponible: true }),
    onSuccess: () => { qc.invalidateQueries(['mes-services']); showToast('Service ajouté !'); },
    onError: (e) => showToast(e.response?.data?.error || 'Erreur', 'error'),
  });

  const { mutate: retirer } = useMutation({
    mutationFn: (id) => api.delete(`/hopitaux/${structureId}/services/${id}`),
    onSuccess: () => { qc.invalidateQueries(['mes-services']); showToast('Service retiré.'); },
  });

  const { mutate: updateItem } = useMutation({
    mutationFn: ({ id, data }) => api.put(`/hopitaux/${structureId}/services/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['mes-services']); setEditId(null); showToast('Mis à jour !'); },
  });

  const catGrouped = catalogue.reduce((acc, s) => {
    const k = s.categorie || 'Autre';
    if (!acc[k]) acc[k] = [];
    acc[k].push(s); return acc;
  }, {});

  const mesFiltres = mesServices.filter((s) =>
    !searchMes ||
    s.service?.nom?.toLowerCase().includes(searchMes.toLowerCase()) ||
    s.service?.categorie?.toLowerCase().includes(searchMes.toLowerCase())
  );

  const mesGroupes = mesFiltres.reduce((acc, s) => {
    const k = s.service?.categorie || 'Autre';
    if (!acc[k]) acc[k] = [];
    acc[k].push(s); return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.couleurClair }}>
          <Building2 size={20} style={{ color: theme.couleur }}/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{label}</h1>
          <p className="text-gray-500 text-sm">{mesServices.length} service(s) · visibles sur le site public</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ k:'mes', l:`Mes ${label.toLowerCase()}` }, { k:'ajouter', l:'+ Ajouter depuis le catalogue' }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.k ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={tab === t.k ? { backgroundColor: theme.couleur } : {}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── Mes services ──────────────────────────────────────── */}
      {tab === 'mes' && (
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher dans mes services..."
              value={searchMes} onChange={(e) => setSearchMes(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>

          {mesServices.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-medium">Aucun service ajouté</p>
              <button onClick={() => setTab('ajouter')}
                className="mt-4 px-5 py-2 text-sm font-semibold text-white rounded-xl"
                style={{ backgroundColor: theme.couleur }}>
                Voir le catalogue →
              </button>
            </div>
          ) : (
            Object.entries(mesGroupes).map(([cat, items]) => (
              <div key={cat} className="mb-5">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{cat} ({items.length})</p>
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                  {items.map((hs, i) => (
                    <div key={hs.id}
                      className={`px-4 py-3 ${i < items.length-1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{hs.service?.nom}</p>
                          <div className="flex items-center gap-3 mt-1 flex-wrap">
                            {hs.prixConsultation && (
                              <span className="text-xs font-semibold" style={{ color: theme.couleur }}>
                                {hs.prixConsultation.toLocaleString()} FCFA
                              </span>
                            )}
                            {hs.modeConsultation && (
                              <span className="text-xs text-gray-400">
                                {MODES.find((m) => m.value === hs.modeConsultation)?.label}
                              </span>
                            )}
                            {hs.infoSupplementaire && (
                              <span className="text-xs text-gray-400 italic">{hs.infoSupplementaire}</span>
                            )}
                          </div>
                        </div>

                        {/* Edit */}
                        {editId === hs.id ? (
                          <div className="flex flex-col gap-2 min-w-0 flex-1">
                            <div className="flex gap-2 flex-wrap">
                              <input type="number" value={editVals.prix}
                                onChange={(e) => setEditVals((p) => ({ ...p, prix: e.target.value }))}
                                className="w-32 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none"
                                placeholder="Prix consultation FCFA"/>
                              <select value={editVals.mode}
                                onChange={(e) => setEditVals((p) => ({ ...p, mode: e.target.value }))}
                                className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none">
                                {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
                              </select>
                            </div>
                            <input type="text" value={editVals.info}
                              onChange={(e) => setEditVals((p) => ({ ...p, info: e.target.value }))}
                              className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none"
                              placeholder="Info complémentaire (salle, horaire spécial...)"/>
                            <div className="flex gap-2">
                              <button onClick={() => updateItem({ id: hs.id, data: {
                                prixConsultation: parseFloat(editVals.prix) || null,
                                modeConsultation: editVals.mode,
                                infoSupplementaire: editVals.info || null,
                              }})}
                                className="text-xs px-3 py-1.5 text-white rounded-lg"
                                style={{ backgroundColor: theme.couleur }}>
                                ✓ Enregistrer
                              </button>
                              <button onClick={() => setEditId(null)}
                                className="text-xs px-3 py-1.5 bg-gray-100 text-gray-500 rounded-lg">Annuler</button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setEditId(hs.id);
                              setEditVals({
                                prix: hs.prixConsultation?.toString() || '',
                                mode: hs.modeConsultation || 'JOURS_OUVRABLES',
                                info: hs.infoSupplementaire || '',
                              });
                            }}
                            className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-500 hover:bg-gray-50 shrink-0">
                            ✏️ Modifier
                          </button>
                        )}

                        <button onClick={() => { if(window.confirm('Retirer ce service ?')) retirer(hs.id); }}
                          className="p-1.5 text-red-300 hover:text-red-500 rounded-lg shrink-0">
                          <Trash2 size={14}/>
                        </button>
                      </div>
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
              <input type="text" placeholder="Rechercher un service..."
                value={searchCat} onChange={(e) => setSearchCat(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">Toutes catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <p className="text-sm text-gray-400 mb-4">{catalogue.length} services disponibles dans le catalogue AZAMED</p>

          {Object.entries(catGrouped).map(([cat, items]) => (
            <div key={cat} className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{cat} ({items.length})</p>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {items.map((sv, i) => {
                  const deja = mesIds.has(sv.id);
                  return (
                    <div key={sv.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i < items.length-1 ? 'border-b border-gray-50' : ''} ${deja ? 'bg-green-50/30' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{sv.nom}</p>
                        {sv.description && <p className="text-xs text-gray-400 truncate">{sv.description}</p>}
                      </div>
                      {deja ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-semibold px-2.5 py-1.5 bg-green-100 rounded-lg shrink-0">
                          <CheckCircle size={11}/> Ajouté
                        </span>
                      ) : (
                        <button onClick={() => ajouter(sv.id)}
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
              <p>Aucun service dans le catalogue.</p>
              <p className="text-sm mt-1">L'admin doit charger le catalogue depuis le site admin.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
