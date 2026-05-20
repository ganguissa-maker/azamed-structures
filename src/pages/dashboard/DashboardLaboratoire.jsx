// src/pages/dashboard/DashboardLaboratoire.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, TestTube2 } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import { STRUCTURE_THEMES } from '../../utils/structureThemes';
import api from '../../utils/api';

export default function DashboardLaboratoire() {
  const { user }      = useAuthStore();
  const structureId   = user?.structure?.id;
  const typeStructure = user?.structure?.typeStructure || 'LABORATOIRE';
  const theme         = STRUCTURE_THEMES[typeStructure] || { couleur:'#7b2d42', couleurClair:'#fce4ec' };
  const qc            = useQueryClient();

  const [searchCatalogue, setSearchCatalogue] = useState('');
  const [searchMes, setSearchMes]             = useState('');
  const [catFilter, setCatFilter]             = useState('');
  const [tab, setTab]                         = useState('mes');

  // Catalogue d'examens
  const { data: catalogueData } = useQuery({
    queryKey: ['catalogue-examens', searchCatalogue, catFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: 100 });
      if (searchCatalogue) p.set('search', searchCatalogue);
      if (catFilter)       p.set('categorie', catFilter);
      const { data } = await api.get(`/admin/examens?${p}`);
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

  const catalogue  = catalogueData?.data || catalogueData || [];
  const mesExamens = mesData?.data || [];
  const mesIds     = new Set(mesExamens.map((e) => e.examenId));

  // Catégories disponibles
  const categories = [...new Set(catalogue.map((e) => e.categorie))].sort();

  const { mutate: ajouter } = useMutation({
    mutationFn: ({ examenId }) =>
      api.post(`/laboratoires/${structureId}/examens`, { examenId, disponible: true }),
    onSuccess: () => { qc.invalidateQueries(['mes-examens']); toast.success('Examen ajouté !'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: retirer } = useMutation({
    mutationFn: (id) => api.delete(`/laboratoires/${structureId}/examens/${id}`),
    onSuccess: () => { qc.invalidateQueries(['mes-examens']); toast.success('Examen retiré.'); },
  });

  const { mutate: update } = useMutation({
    mutationFn: ({ id, data }) => api.put(`/laboratoires/${structureId}/examens/${id}`, data),
    onSuccess: () => qc.invalidateQueries(['mes-examens']),
  });

  const mesFiltres = mesExamens.filter((e) =>
    !searchMes ||
    e.examen?.nom?.toLowerCase().includes(searchMes.toLowerCase()) ||
    e.examen?.categorie?.toLowerCase().includes(searchMes.toLowerCase())
  );

  // Grouper par catégorie
  const mesGroupes = mesFiltres.reduce((acc, e) => {
    const k = e.examen?.categorie || 'Autres';
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
          <p className="text-gray-500 text-sm">{mesExamens.length} examen(s) renseigné(s)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ k:'mes', label:'Mes examens' }, { k:'ajouter', label:'Ajouter du catalogue' }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.k ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={tab === t.k ? { backgroundColor: theme.couleur } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab : Mes examens */}
      {tab === 'mes' && (
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher dans mes examens..."
              value={searchMes} onChange={(e) => setSearchMes(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>

          {mesFiltres.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <TestTube2 size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-medium">Aucun examen renseigné</p>
              <button onClick={() => setTab('ajouter')}
                className="mt-3 px-4 py-2 text-sm font-semibold text-white rounded-xl"
                style={{ backgroundColor: theme.couleur }}>
                Voir le catalogue
              </button>
            </div>
          ) : (
            Object.entries(mesGroupes).map(([cat, items]) => (
              <div key={cat} className="card p-0 overflow-hidden mb-4">
                <div className="px-4 py-2.5 border-b text-xs font-bold uppercase tracking-wider"
                  style={{ backgroundColor: theme.couleurClair, color: theme.couleur }}>
                  {cat} ({items.length})
                </div>
                <div className="divide-y divide-gray-50">
                  {items.map((le) => (
                    <div key={le.id} className="px-4 py-3 flex items-center gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-gray-900">{le.examen?.nom}</p>
                        <p className="text-xs text-gray-400">{le.examen?.codeAzamed}</p>
                      </div>
                      {/* Prix */}
                      <input type="number" placeholder="Prix CFA"
                        defaultValue={le.prix || ''}
                        onBlur={(e) => update({ id: le.id, data: { prix: parseFloat(e.target.value) || null } })}
                        className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none text-center"
                        min="0"/>
                      {/* Délai */}
                      <input type="number" placeholder="Délai h"
                        defaultValue={le.delaiMax || ''}
                        onBlur={(e) => update({ id: le.id, data: { delaiMax: parseInt(e.target.value) || null } })}
                        className="w-20 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none text-center"
                        min="0"/>
                      <button onClick={() => retirer(le.id)}
                        className="p-1.5 text-red-300 hover:text-red-500 rounded-lg transition-colors">
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

      {/* Tab : Catalogue */}
      {tab === 'ajouter' && (
        <div>
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
              <input type="text" placeholder="Rechercher un examen..."
                value={searchCatalogue} onChange={(e) => setSearchCatalogue(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)}
              className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">Toutes catégories</option>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
              {catalogue.map((ex) => {
                const dejaDans = mesIds.has(ex.id);
                return (
                  <div key={ex.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{ex.nom}</p>
                      <p className="text-xs text-gray-400">{ex.codeAzamed}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: theme.couleur }}>{ex.categorie}</p>
                    </div>
                    {dejaDans ? (
                      <span className="text-xs text-green-600 font-semibold px-2.5 py-1.5 bg-green-50 rounded-lg">✓ Ajouté</span>
                    ) : (
                      <button onClick={() => ajouter({ examenId: ex.id })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg"
                        style={{ backgroundColor: theme.couleur }}>
                        <Plus size={12}/> Ajouter
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
