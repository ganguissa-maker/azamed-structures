// src/pages/dashboard/DashboardHopital.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, Building2 } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import { STRUCTURE_THEMES } from '../../utils/structureThemes';
import api from '../../utils/api';

const MODES_CONSULTATION = [
  { value:'JOURS_OUVRABLES', label:'Jours ouvrables' },
  { value:'TOUS_LES_JOURS',  label:'Tous les jours' },
  { value:'SUR_RDV',         label:'Sur rendez-vous' },
];

export default function DashboardHopital() {
  const { user }      = useAuthStore();
  const structureId   = user?.structure?.id;
  const typeStructure = user?.structure?.typeStructure || 'HOPITAL_PUBLIC';
  const theme         = STRUCTURE_THEMES[typeStructure] || { couleur:'#1565c0', couleurClair:'#e3f2fd' };
  const qc            = useQueryClient();

  const [searchCatalogue, setSearchCatalogue] = useState('');
  const [searchMes, setSearchMes]             = useState('');
  const [catFilter, setCatFilter]             = useState('');
  const [tab, setTab]                         = useState('mes');

  // Catalogue services
  const { data: catalogueData } = useQuery({
    queryKey: ['catalogue-services', searchCatalogue, catFilter],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: 150 });
      if (searchCatalogue) p.set('search', searchCatalogue);
      if (catFilter)       p.set('categorie', catFilter);
      const { data } = await api.get(`/admin/services?${p}`);
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

  const catalogue  = catalogueData?.data || catalogueData || [];
  const mesServices = mesData?.data || [];
  const mesIds     = new Set(mesServices.map((s) => s.serviceId));
  const categories = [...new Set(catalogue.map((s) => s.categorie))].sort();

  const { mutate: ajouter } = useMutation({
    mutationFn: ({ serviceId }) =>
      api.post(`/hopitaux/${structureId}/services`, { serviceId, disponible: true }),
    onSuccess: () => { qc.invalidateQueries(['mes-services']); toast.success('Service ajouté !'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: retirer } = useMutation({
    mutationFn: (id) => api.delete(`/hopitaux/${structureId}/services/${id}`),
    onSuccess: () => { qc.invalidateQueries(['mes-services']); toast.success('Service retiré.'); },
  });

  const { mutate: update } = useMutation({
    mutationFn: ({ id, data }) => api.put(`/hopitaux/${structureId}/services/${id}`, data),
    onSuccess: () => qc.invalidateQueries(['mes-services']),
  });

  const mesFiltres = mesServices.filter((s) =>
    !searchMes ||
    s.service?.nom?.toLowerCase().includes(searchMes.toLowerCase()) ||
    s.service?.categorie?.toLowerCase().includes(searchMes.toLowerCase())
  );

  const mesGroupes = mesFiltres.reduce((acc, s) => {
    const k = s.service?.categorie || 'Autres';
    if (!acc[k]) acc[k] = [];
    acc[k].push(s); return acc;
  }, {});

  const titleLabel = ['CABINET_MEDICAL','CABINET_SPECIALISE'].includes(typeStructure)
    ? 'Consultations' : 'Services médicaux';

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.couleurClair }}>
          <Building2 size={20} style={{ color: theme.couleur }}/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{titleLabel}</h1>
          <p className="text-gray-500 text-sm">{mesServices.length} service(s) renseigné(s)</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ k:'mes', label:'Mes services' }, { k:'ajouter', label:'Ajouter du catalogue' }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.k ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={tab === t.k ? { backgroundColor: theme.couleur } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab : Mes services */}
      {tab === 'mes' && (
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher dans mes services..."
              value={searchMes} onChange={(e) => setSearchMes(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>

          {mesFiltres.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Building2 size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-medium">Aucun service renseigné</p>
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
                  {items.map((hs) => (
                    <div key={hs.id} className="px-4 py-3">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold text-sm text-gray-900 flex-1">{hs.service?.nom}</p>
                        <button onClick={() => retirer(hs.id)}
                          className="p-1.5 text-red-300 hover:text-red-500 rounded-lg transition-colors">
                          <Trash2 size={14}/>
                        </button>
                      </div>
                      <div className="flex gap-3 flex-wrap">
                        {/* Prix consultation */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Prix consultation (FCFA)</label>
                          <input type="number" placeholder="Ex: 5000"
                            defaultValue={hs.prixConsultation || ''}
                            onBlur={(e) => update({ id: hs.id, data: { prixConsultation: parseFloat(e.target.value) || null } })}
                            className="w-36 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none"
                            min="0"/>
                        </div>
                        {/* Mode */}
                        <div>
                          <label className="text-xs text-gray-400 block mb-1">Mode de consultation</label>
                          <select defaultValue={hs.modeConsultation || 'JOURS_OUVRABLES'}
                            onChange={(e) => update({ id: hs.id, data: { modeConsultation: e.target.value } })}
                            className="px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none">
                            {MODES_CONSULTATION.map((m) => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>
                        {/* Info sup */}
                        <div className="flex-1">
                          <label className="text-xs text-gray-400 block mb-1">Info complémentaire</label>
                          <input type="text" placeholder="Ex: Salle 3, Lun-Ven"
                            defaultValue={hs.infoSupplementaire || ''}
                            onBlur={(e) => update({ id: hs.id, data: { infoSupplementaire: e.target.value || null } })}
                            className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none"/>
                        </div>
                      </div>
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
              <input type="text" placeholder="Rechercher un service..."
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
              {catalogue.map((sv) => {
                const dejaDans = mesIds.has(sv.id);
                return (
                  <div key={sv.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900">{sv.nom}</p>
                      {sv.description && <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{sv.description}</p>}
                      <p className="text-xs font-medium mt-0.5" style={{ color: theme.couleur }}>{sv.categorie}</p>
                    </div>
                    {dejaDans ? (
                      <span className="text-xs text-green-600 font-semibold px-2.5 py-1.5 bg-green-50 rounded-lg">✓ Ajouté</span>
                    ) : (
                      <button onClick={() => ajouter({ serviceId: sv.id })}
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
