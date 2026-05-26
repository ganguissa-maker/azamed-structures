// src/pages/dashboard/DashboardLaboratoire.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, CheckCircle, TestTube2 } from 'lucide-react';
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

export default function DashboardLaboratoire() {
  const { user }      = useAuthStore();
  const structureId   = user?.structure?.id;
  const typeStructure = user?.structure?.typeStructure || 'LABORATOIRE';
  const theme         = STRUCTURE_THEMES[typeStructure] || { couleur:'#7b2d42', couleurClair:'#fce4ec' };
  const qc            = useQueryClient();

  const [searchCat, setSearchCat] = useState('');
  const [searchMes, setSearchMes] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [tab, setTab]             = useState('mes');
  const [editId, setEditId]       = useState(null);
  const [editVals, setEditVals]   = useState({ prix: '', delaiMax: '' });

  // Catalogue examens
  const { data: catData } = useQuery({
    queryKey: ['cat-examens', searchCat, catFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: 200 });
      if (searchCat)  p.set('search', searchCat);
      if (catFilter)  p.set('categorie', catFilter);
      const { data } = await api.get(`/catalogue/examens?${p}`);
      return data;
    },
  });

  // Mes examens
  const { data: mesData } = useQuery({
    queryKey: ['mes-examens', structureId],
    queryFn: async () => {
      const { data } = await api.get(`/laboratoires/${structureId}/examens`);
      return data;
    },
    enabled: !!structureId,
  });

  const catalogue  = catData?.data  || [];
  const mesExamens = mesData?.data   || [];
  const mesIds     = new Set(mesExamens.map((e) => e.examenId));
  const categories = [...new Set(catalogue.map((e) => e.categorie).filter(Boolean))].sort();

  const { mutate: ajouter } = useMutation({
    mutationFn: (examenId) =>
      api.post(`/laboratoires/${structureId}/examens`, { examenId, disponible: true }),
    onSuccess: () => { qc.invalidateQueries(['mes-examens']); showToast('Examen ajouté !'); },
    onError: (e) => showToast(e.response?.data?.error || 'Erreur', 'error'),
  });

  const { mutate: retirer } = useMutation({
    mutationFn: (id) => api.delete(`/laboratoires/${structureId}/examens/${id}`),
    onSuccess: () => { qc.invalidateQueries(['mes-examens']); showToast('Examen retiré.'); },
  });

  const { mutate: updateItem } = useMutation({
    mutationFn: ({ id, data }) => api.put(`/laboratoires/${structureId}/examens/${id}`, data),
    onSuccess: () => { qc.invalidateQueries(['mes-examens']); setEditId(null); showToast('Mis à jour !'); },
  });

  const catGrouped = catalogue.reduce((acc, e) => {
    const k = e.categorie || 'Autre';
    if (!acc[k]) acc[k] = [];
    acc[k].push(e); return acc;
  }, {});

  const mesFiltres = mesExamens.filter((e) =>
    !searchMes ||
    e.examen?.nom?.toLowerCase().includes(searchMes.toLowerCase()) ||
    e.examen?.categorie?.toLowerCase().includes(searchMes.toLowerCase())
  );

  const mesGroupes = mesFiltres.reduce((acc, e) => {
    const k = e.examen?.categorie || 'Autre';
    if (!acc[k]) acc[k] = [];
    acc[k].push(e); return acc;
  }, {});

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.couleurClair }}>
          <TestTube2 size={20} style={{ color: theme.couleur }}/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Examens</h1>
          <p className="text-gray-500 text-sm">{mesExamens.length} examen(s) · visibles sur le site public</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {[{ k:'mes', l:'Mes examens' }, { k:'ajouter', l:'+ Ajouter depuis le catalogue' }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.k ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={tab === t.k ? { backgroundColor: theme.couleur } : {}}>
            {t.l}
          </button>
        ))}
      </div>

      {/* ── Mes examens ─────────────────────────────────────── */}
      {tab === 'mes' && (
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher dans mes examens..."
              value={searchMes} onChange={(e) => setSearchMes(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>

          {mesExamens.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <TestTube2 size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-medium">Aucun examen ajouté</p>
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
                  {items.map((le, i) => (
                    <div key={le.id}
                      className={`px-4 py-3 ${i < items.length-1 ? 'border-b border-gray-50' : ''}`}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-gray-900">{le.examen?.nom}</p>
                          <p className="text-xs text-gray-400">{le.examen?.codeAzamed}</p>
                        </div>

                        {/* Edit prix + délai */}
                        {editId === le.id ? (
                          <div className="flex items-center gap-2 flex-wrap">
                            <input type="number" value={editVals.prix}
                              onChange={(e) => setEditVals((p) => ({ ...p, prix: e.target.value }))}
                              className="w-28 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none text-center"
                              placeholder="Prix FCFA"/>
                            <input type="number" value={editVals.delaiMax}
                              onChange={(e) => setEditVals((p) => ({ ...p, delaiMax: e.target.value }))}
                              className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none text-center"
                              placeholder="Délai (h)"/>
                            <button onClick={() => updateItem({ id: le.id, data: { prix: parseFloat(editVals.prix) || null, delaiMax: parseInt(editVals.delaiMax) || null } })}
                              className="text-xs px-2.5 py-1.5 text-white rounded-lg"
                              style={{ backgroundColor: theme.couleur }}>✓</button>
                            <button onClick={() => setEditId(null)}
                              className="text-xs px-2.5 py-1.5 bg-gray-100 text-gray-500 rounded-lg">✕</button>
                          </div>
                        ) : (
                          <button onClick={() => { setEditId(le.id); setEditVals({ prix: le.prix?.toString() || '', delaiMax: le.delaiMax?.toString() || '' }); }}
                            className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 shrink-0">
                            {le.prix ? `${le.prix.toLocaleString()} FCFA` : '+ Prix'}
                            {le.delaiMax ? ` · ~${le.delaiMax}h` : ''}
                          </button>
                        )}

                        <button onClick={() => { if(window.confirm('Retirer cet examen ?')) retirer(le.id); }}
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
              <input type="text" placeholder="Rechercher un examen..."
                value={searchCat} onChange={(e) => setSearchCat(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">Toutes catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <p className="text-sm text-gray-400 mb-4">{catalogue.length} examens disponibles dans le catalogue AZAMED</p>

          {Object.entries(catGrouped).map(([cat, items]) => (
            <div key={cat} className="mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 px-1">{cat} ({items.length})</p>
              <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                {items.map((ex, i) => {
                  const deja = mesIds.has(ex.id);
                  return (
                    <div key={ex.id}
                      className={`flex items-center gap-3 px-4 py-3 ${i < items.length-1 ? 'border-b border-gray-50' : ''} ${deja ? 'bg-green-50/30' : ''}`}>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{ex.nom}</p>
                        <p className="text-xs text-gray-400">{ex.codeAzamed}</p>
                      </div>
                      {deja ? (
                        <span className="flex items-center gap-1 text-xs text-green-600 font-semibold px-2.5 py-1.5 bg-green-100 rounded-lg shrink-0">
                          <CheckCircle size={11}/> Ajouté
                        </span>
                      ) : (
                        <button onClick={() => ajouter(ex.id)}
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
        </div>
      )}
    </div>
  );
}
