// src/pages/dashboard/DashboardPharmacie.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, Plus, Trash2, CheckCircle, XCircle, Package } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import { STRUCTURE_THEMES } from '../../utils/structureThemes';
import api from '../../utils/api';

export default function DashboardPharmacie() {
  const { user }      = useAuthStore();
  const structureId   = user?.structure?.id;
  const typeStructure = user?.structure?.typeStructure || 'PHARMACIE';
  const theme         = STRUCTURE_THEMES[typeStructure] || { couleur:'#2d6a4f', couleurClair:'#d8f3dc' };
  const qc            = useQueryClient();

  const [searchCatalogue, setSearchCatalogue] = useState('');
  const [searchMes, setSearchMes]             = useState('');
  const [tab, setTab]                         = useState('mes'); // 'mes' | 'ajouter'

  // Catalogue complet
  const { data: catalogueData } = useQuery({
    queryKey: ['catalogue-meds', searchCatalogue],
    queryFn: async () => {
      const p = new URLSearchParams({ limit: 50 });
      if (searchCatalogue) p.set('search', searchCatalogue);
      const { data } = await api.get(`/admin/medicaments?${p}`);
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

  const catalogue  = catalogueData?.data || catalogueData || [];
  const mesMeds    = mesData?.data || [];
  const mesIds     = new Set(mesMeds.map((m) => m.medicamentId));

  // Ajouter un médicament
  const { mutate: ajouter, isPending: adding } = useMutation({
    mutationFn: ({ medicamentId }) =>
      api.post(`/pharmacies/${structureId}/medicaments`, { medicamentId, enStock: true, disponible: true }),
    onSuccess: () => { qc.invalidateQueries(['mes-meds']); toast.success('Médicament ajouté !'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  // Retirer un médicament
  const { mutate: retirer } = useMutation({
    mutationFn: (id) => api.delete(`/pharmacies/${structureId}/medicaments/${id}`),
    onSuccess: () => { qc.invalidateQueries(['mes-meds']); toast.success('Médicament retiré.'); },
  });

  // Mettre à jour stock/prix
  const { mutate: update } = useMutation({
    mutationFn: ({ id, data }) => api.put(`/pharmacies/${structureId}/medicaments/${id}`, data),
    onSuccess: () => qc.invalidateQueries(['mes-meds']),
  });

  const mesFiltres = mesMeds.filter((m) =>
    !searchMes ||
    m.medicament?.nomCommercial?.toLowerCase().includes(searchMes.toLowerCase()) ||
    m.medicament?.dci?.toLowerCase().includes(searchMes.toLowerCase())
  );

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
            {mesMeds.length} médicament{mesMeds.length > 1 ? 's' : ''} dans votre stock
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[{ k:'mes', label:'Mes médicaments' }, { k:'ajouter', label:'Ajouter du catalogue' }].map((t) => (
          <button key={t.k} onClick={() => setTab(t.k)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
              tab === t.k ? 'text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            style={tab === t.k ? { backgroundColor: theme.couleur } : {}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab : Mes médicaments */}
      {tab === 'mes' && (
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher dans mes médicaments..."
              value={searchMes} onChange={(e) => setSearchMes(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>

          {mesFiltres.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Package size={40} className="mx-auto mb-3 opacity-30"/>
              <p className="font-medium">Aucun médicament</p>
              <p className="text-sm mt-1">Ajoutez des médicaments depuis le catalogue</p>
              <button onClick={() => setTab('ajouter')}
                className="mt-3 px-4 py-2 text-sm font-semibold text-white rounded-xl"
                style={{ backgroundColor: theme.couleur }}>
                Voir le catalogue
              </button>
            </div>
          ) : (
            <div className="card p-0 overflow-hidden">
              <div className="px-4 py-3 border-b text-xs font-bold uppercase tracking-wider"
                style={{ backgroundColor: theme.couleurClair, color: theme.couleur }}>
                {mesFiltres.length} médicament(s)
              </div>
              <div className="divide-y divide-gray-50">
                {mesFiltres.map((pm) => (
                  <div key={pm.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{pm.medicament?.nomCommercial}</p>
                      <p className="text-xs text-gray-400">{pm.medicament?.dci} · {pm.medicament?.forme} · {pm.medicament?.dosage}</p>
                    </div>

                    {/* Prix */}
                    <input type="number" placeholder="Prix CFA"
                      defaultValue={pm.prix || ''}
                      onBlur={(e) => update({ id: pm.id, data: { prix: parseFloat(e.target.value) || null } })}
                      className="w-24 px-2 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none text-center"
                      min="0"/>

                    {/* En stock */}
                    <button onClick={() => update({ id: pm.id, data: { enStock: !pm.enStock } })}
                      className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        pm.enStock ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {pm.enStock ? <CheckCircle size={11}/> : <XCircle size={11}/>}
                      {pm.enStock ? 'En stock' : 'Rupture'}
                    </button>

                    <button onClick={() => retirer(pm.id)}
                      className="p-1.5 text-red-300 hover:text-red-500 rounded-lg transition-colors">
                      <Trash2 size={14}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Tab : Catalogue */}
      {tab === 'ajouter' && (
        <div>
          <div className="relative mb-4">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Rechercher un médicament dans le catalogue..."
              value={searchCatalogue} onChange={(e) => setSearchCatalogue(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="divide-y divide-gray-50 max-h-[70vh] overflow-y-auto">
              {catalogue.map((med) => {
                const dejaDans = mesIds.has(med.id);
                return (
                  <div key={med.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-900 truncate">{med.nomCommercial}</p>
                      <p className="text-xs text-gray-400">{med.dci} · {med.forme} · {med.dosage}</p>
                      <p className="text-xs font-medium mt-0.5" style={{ color: theme.couleur }}>
                        {med.classeTherapeutique}
                      </p>
                    </div>
                    {dejaDans ? (
                      <span className="text-xs text-green-600 font-semibold px-2.5 py-1.5 bg-green-50 rounded-lg">
                        ✓ Ajouté
                      </span>
                    ) : (
                      <button onClick={() => ajouter({ medicamentId: med.id })} disabled={adding}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white rounded-lg transition-colors disabled:opacity-50"
                        style={{ backgroundColor: theme.couleur }}>
                        <Plus size={12}/> Ajouter
                      </button>
                    )}
                  </div>
                );
              })}
              {catalogue.length === 0 && (
                <div className="text-center py-10 text-gray-400 text-sm">
                  Aucun médicament trouvé dans le catalogue
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
