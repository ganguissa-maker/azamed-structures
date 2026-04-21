// src/pages/dashboard/DashboardHopital.jsx — couleur bleu, mode consultation dropdown, garde médecin
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Search, Stethoscope } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const THEME = { primary: '#1d4ed8', light: '#eff6ff', border: '#bfdbfe' }; // bleu

const MODES_CONSULTATION = [
  { value: 'SUR_RDV',         label: 'Sur rendez-vous uniquement' },
  { value: 'JOURS_OUVRABLES', label: 'Jours ouvrables (Lun-Ven)' },
  { value: 'TOUS_LES_JOURS',  label: 'Tous les jours' },
];

const MODE_LABELS = {
  SUR_RDV:         '📅 Sur RDV',
  JOURS_OUVRABLES: '📆 Jours ouvrables',
  TOUS_LES_JOURS:  '🗓️ Tous les jours',
};

export default function DashboardHopital() {
  const { user }    = useAuthStore();
  const structureId = user?.structure?.id;
  const medecinDeGarde = user?.structure?.medecinDeGarde || false;
  const queryClient = useQueryClient();

  const [svcSearch, setSvcSearch]     = useState('');
  const [selectedSvc, setSelectedSvc] = useState(null);
  const [prix, setPrix]               = useState('');
  const [modeConsultation, setMode]   = useState('JOURS_OUVRABLES');

  const { data: myServices } = useQuery({
    queryKey: ['hopital-services', structureId],
    queryFn: async () => { const { data } = await api.get(`/hopitaux/${structureId}/services`); return data; },
    enabled: !!structureId,
  });

  const { data: catalogue } = useQuery({
    queryKey: ['catalogue-services', svcSearch],
    queryFn: async () => {
      const { data } = await api.get(`/hopitaux/catalogue/services?search=${svcSearch}&limit=8`);
      return data;
    },
    enabled: svcSearch.length >= 2,
  });

  const { mutate: addService, isPending: adding } = useMutation({
    mutationFn: () => api.post(`/hopitaux/${structureId}/services`, {
      serviceId: selectedSvc.id,
      prixConsultation: prix || null,
      modeConsultation,
      estDisponible: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['hopital-services']);
      setSelectedSvc(null); setPrix(''); setSvcSearch(''); setMode('JOURS_OUVRABLES');
      toast.success('Service ajouté !');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: deleteService } = useMutation({
    mutationFn: (svcId) => api.delete(`/hopitaux/${structureId}/services/${svcId}`),
    onSuccess: () => { queryClient.invalidateQueries(['hopital-services']); toast.success('Service retiré.'); },
  });

  const { mutate: toggleGardeMedecin } = useMutation({
    mutationFn: () => api.put(`/hopitaux/${structureId}/garde-medecin`, { medecinDeGarde: !medecinDeGarde }),
    onSuccess: (res) => { toast.success(res.data?.message || 'Mis à jour !'); window.location.reload(); },
    onError: () => toast.error('Erreur'),
  });

  const services = myServices?.data || [];
  const grouped  = myServices?.grouped || {};

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Services médicaux</h1>

      {/* Médecin de garde */}
      <div className={`rounded-2xl p-4 mb-6 border-2 flex items-start gap-4 ${medecinDeGarde ? 'bg-blue-50 border-blue-300' : 'bg-gray-50 border-gray-200'}`}>
        <Stethoscope size={24} className={medecinDeGarde ? 'text-blue-500' : 'text-gray-400'} style={{ marginTop: 2 }}/>
        <div className="flex-1">
          <p className="font-bold text-gray-900 text-sm">
            {medecinDeGarde ? '✅ Médecin de garde disponible' : 'Médecin de garde non disponible'}
          </p>
          <p className="text-xs text-gray-500 mt-0.5">
            {medecinDeGarde
              ? 'Un médecin de garde est disponible. Visible par le public sur le site AZAMED.'
              : 'Activez pour signaler la présence d\'un médecin de garde actuellement.'}
          </p>
        </div>
        <button onClick={() => toggleGardeMedecin()}
          style={medecinDeGarde ? {} : { backgroundColor: THEME.primary }}
          className={`shrink-0 px-4 py-2 rounded-xl text-sm font-semibold ${
            medecinDeGarde ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' : 'text-white'
          }`}>
          {medecinDeGarde ? 'Désactiver' : 'Activer'}
        </button>
      </div>

      {/* Ajouter service */}
      <div className="card mb-6" style={{ borderTop: `3px solid ${THEME.primary}` }}>
        <h2 className="font-semibold text-gray-900 mb-3">Ajouter un service</h2>

        <div className="relative mb-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Rechercher dans le catalogue AZAMED..."
            value={svcSearch} onChange={(e) => setSvcSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
        </div>

        {catalogue?.data?.length > 0 && !selectedSvc && (
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
            {catalogue.data.map((s) => (
              <button key={s.id} onClick={() => { setSelectedSvc(s); setSvcSearch(''); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                <p className="font-medium text-sm text-gray-900">{s.nom}</p>
                <p className="text-xs text-gray-400">{s.categorie}</p>
              </button>
            ))}
          </div>
        )}

        {selectedSvc && (
          <div className="rounded-xl p-3 mb-3 flex items-center gap-3" style={{ backgroundColor: THEME.light, border: `1px solid ${THEME.border}` }}>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">{selectedSvc.nom}</p>
              <p className="text-xs text-gray-500">{selectedSvc.categorie}</p>
            </div>
            <button onClick={() => setSelectedSvc(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}

        {selectedSvc && (
          <div className="space-y-3">
            {/* Mode de consultation */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Mode de consultation</label>
              <select value={modeConsultation} onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
                {MODES_CONSULTATION.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
            <div className="flex gap-3 items-end">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Prix consultation (FCFA)</label>
                <input type="number" placeholder="Optionnel" value={prix}
                  onChange={(e) => setPrix(e.target.value)}
                  className="w-36 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
              </div>
              <button onClick={() => addService()} disabled={adding}
                className="px-4 py-2 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
                style={{ backgroundColor: THEME.primary }}>
                {adding ? '...' : 'Ajouter'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Liste services */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: THEME.light }}>
          <h2 className="font-semibold text-sm" style={{ color: THEME.primary }}>
            {services.length} service(s) référencé(s)
          </h2>
        </div>
        <div className="px-5 py-3">
          {services.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucun service ajouté.</p>
          ) : Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-2 py-1 rounded-lg" style={{ backgroundColor: THEME.light }}>
                {cat} ({items.length})
              </p>
              {items.map((s) => (
                <div key={s.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{s.service.nom}</p>
                    <p className="text-xs text-gray-400">{MODE_LABELS[s.modeConsultation] || s.modeConsultation}</p>
                  </div>
                  {s.prixConsultation && (
                    <span className="text-sm font-bold shrink-0" style={{ color: THEME.primary }}>
                      {s.prixConsultation.toLocaleString()} F
                    </span>
                  )}
                  <button onClick={() => deleteService(s.service.id)}
                    className="p-1 text-red-300 hover:text-red-500 rounded transition-colors">
                    <Trash2 size={13}/>
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
