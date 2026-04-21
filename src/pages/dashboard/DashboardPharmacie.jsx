// src/pages/dashboard/DashboardPharmacie.jsx
// Couleur : vert militaire (#4a7c59) — garde sur PHARMACIE pas médicament
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search, ShieldAlert, ShieldCheck } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const THEME = { primary: '#4a7c59', light: '#f0f4f1', border: '#c8ddd1' }; // vert militaire

function MedCard({ pm, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-900 truncate">{pm.medicament.nomCommercial}</p>
        <p className="text-xs text-gray-400">{pm.medicament.dci} · {pm.medicament.forme}</p>
      </div>
      {pm.prix && (
        <span className="text-sm font-bold shrink-0" style={{ color: THEME.primary }}>
          {pm.prix.toLocaleString()} F
        </span>
      )}
      <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${pm.enStock ? 'bg-green-500' : 'bg-gray-300'}`}
        title={pm.enStock ? 'En stock' : 'Rupture'}/>
      <button onClick={() => onDelete(pm.medicament.id)}
        className="p-1 text-red-300 hover:text-red-500 rounded transition-colors">
        <Trash2 size={13}/>
      </button>
    </div>
  );
}

export default function DashboardPharmacie() {
  const { user }    = useAuthStore();
  const structureId = user?.structure?.id;
  const estDeGarde  = user?.structure?.estDeGarde || false;
  const queryClient = useQueryClient();

  const [search, setSearch]   = useState('');
  const [medSearch, setMedSearch] = useState('');
  const [selectedMed, setSelectedMed] = useState(null);
  const [prix, setPrix]       = useState('');
  const [enStock, setEnStock] = useState(true);

  const { data: myMeds } = useQuery({
    queryKey: ['pharma-meds', structureId, search],
    queryFn: async () => {
      const { data } = await api.get(`/pharmacies/${structureId}/medicaments?search=${search}`);
      return data;
    },
    enabled: !!structureId,
  });

  const { data: catalogue } = useQuery({
    queryKey: ['catalogue-meds', medSearch],
    queryFn: async () => {
      const { data } = await api.get(`/pharmacies/catalogue/medicaments?search=${medSearch}&limit=8`);
      return data;
    },
    enabled: medSearch.length >= 2,
  });

  const { mutate: addMed, isPending: adding } = useMutation({
    mutationFn: () => api.post(`/pharmacies/${structureId}/medicaments`, {
      medicamentId: selectedMed.id, prix: prix || null, enStock,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['pharma-meds']);
      setSelectedMed(null); setPrix(''); setMedSearch('');
      toast.success('Médicament ajouté !');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: deleteMed } = useMutation({
    mutationFn: (medId) => api.delete(`/pharmacies/${structureId}/medicaments/${medId}`),
    onSuccess: () => { queryClient.invalidateQueries(['pharma-meds']); toast.success('Médicament retiré.'); },
  });

  const { mutate: toggleGarde } = useMutation({
    mutationFn: () => api.put(`/pharmacies/${structureId}/garde`, { estDeGarde: !estDeGarde }),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['auth-me']);
      // Mettre à jour le store local
      toast.success(res.data?.message || 'Mode garde mis à jour !');
      window.location.reload(); // refresh pour MAJ sidebar
    },
    onError: () => toast.error('Erreur'),
  });

  const meds = myMeds?.data || [];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Médicaments disponibles</h1>

      {/* ─── Mode Garde pharmacie ─── */}
      <div className={`rounded-2xl p-4 mb-6 border-2 flex items-start gap-4 ${estDeGarde ? 'bg-green-50 border-green-300' : 'bg-gray-50 border-gray-200'}`}>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm flex items-center gap-2">
            {estDeGarde
              ? <><ShieldCheck size={18} className="text-green-500"/>Pharmacie de garde activée</>
              : <><ShieldAlert size={18} className="text-gray-400"/>Mode garde désactivé</>}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {estDeGarde
              ? 'Votre pharmacie apparaît dans la liste des pharmacies de garde visible par le public.'
              : 'Activez le mode garde pour apparaître dans les pharmacies de garde.'}
          </p>
        </div>
        <button onClick={() => toggleGarde()}
          style={estDeGarde ? {} : { backgroundColor: THEME.primary }}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
            estDeGarde
              ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              : 'text-white hover:opacity-90'
          }`}>
          {estDeGarde ? 'Désactiver' : 'Activer la garde'}
        </button>
      </div>

      {/* ─── Ajouter médicament ─── */}
      <div className="card mb-6" style={{ borderTop: `3px solid ${THEME.primary}` }}>
        <h2 className="font-semibold text-gray-900 mb-3">Ajouter un médicament</h2>

        <div className="relative mb-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Rechercher dans le catalogue AZAMED..."
            value={medSearch} onChange={(e) => setMedSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"
            style={{ '--tw-ring-color': THEME.primary }}/>
        </div>

        {/* Résultats catalogue */}
        {catalogue?.data?.length > 0 && !selectedMed && (
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
            {catalogue.data.map((m) => (
              <button key={m.id} onClick={() => { setSelectedMed(m); setMedSearch(''); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                <p className="font-medium text-sm text-gray-900">{m.nomCommercial}</p>
                <p className="text-xs text-gray-400">{m.dci} · {m.classeTherapeutique}</p>
              </button>
            ))}
          </div>
        )}

        {/* Médicament sélectionné */}
        {selectedMed && (
          <div className="rounded-xl p-3 mb-3 flex items-center gap-3" style={{ backgroundColor: THEME.light, border: `1px solid ${THEME.border}` }}>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">{selectedMed.nomCommercial}</p>
              <p className="text-xs text-gray-500">{selectedMed.dci}</p>
            </div>
            <button onClick={() => setSelectedMed(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}

        {selectedMed && (
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <label className="block text-xs font-medium text-gray-600 mb-1">Prix (FCFA)</label>
              <input type="number" placeholder="Optionnel" value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <input type="checkbox" id="stock" checked={enStock} onChange={(e) => setEnStock(e.target.checked)}
                className="w-4 h-4 cursor-pointer"/>
              <label htmlFor="stock" className="text-sm text-gray-600 cursor-pointer">En stock</label>
            </div>
            <button onClick={() => addMed()} disabled={adding}
              className="px-4 py-2 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: THEME.primary }}>
              {adding ? '...' : 'Ajouter'}
            </button>
          </div>
        )}
      </div>

      {/* ─── Liste médicaments ─── */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: THEME.light }}>
          <h2 className="font-semibold text-sm" style={{ color: THEME.primary }}>
            {meds.length} médicament(s) référencé(s)
          </h2>
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"/>
            <input type="text" placeholder="Filtrer..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-7 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none w-36"/>
          </div>
        </div>
        <div className="px-5 py-2 divide-y divide-gray-50">
          {meds.length === 0
            ? <p className="text-sm text-gray-400 text-center py-8">Aucun médicament ajouté.</p>
            : meds.map((pm) => <MedCard key={pm.id} pm={pm} onDelete={deleteMed}/>)}
        </div>
      </div>
    </div>
  );
}
