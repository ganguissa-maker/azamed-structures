// src/pages/dashboard/DashboardImagerie.jsx — Centre d'imagerie (bleu marine)
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Search, Plus } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const THEME = { primary: '#1a237e', light: '#e8eaf6', border: '#9fa8da' };

const EQUIPEMENTS = [
  'Radiographie standard','Échographie abdominale','Échographie obstétricale',
  'Scanner (TDM)','IRM','Mammographie','Densitométrie osseuse','Fluoroscopie',
  'Panoramique dentaire','Coronarographie','Scintigraphie',
];

const MODES = [
  { value:'SUR_RDV',         label:'Sur rendez-vous uniquement' },
  { value:'JOURS_OUVRABLES', label:'Jours ouvrables (Lun-Ven)' },
  { value:'TOUS_LES_JOURS',  label:'Tous les jours' },
];

export default function DashboardImagerie() {
  const { user }    = useAuthStore();
  const structureId = user?.structure?.id;
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState('');
  const [prix, setPrix]         = useState('');
  const [delai, setDelai]       = useState('');
  const [mode, setMode]         = useState('JOURS_OUVRABLES');
  const [custom, setCustom]     = useState('');

  // On réutilise la table HopitalService avec catégorie "Imagerie"
  const { data: myServices } = useQuery({
    queryKey: ['imagerie-services', structureId],
    queryFn: async () => {
      const { data } = await api.get(`/hopitaux/${structureId}/services?disponible=true`);
      return data;
    },
    enabled: !!structureId,
  });

  // Catalogue filtré imagerie
  const { data: catalogue } = useQuery({
    queryKey: ['catalogue-imagerie'],
    queryFn: async () => {
      const { data } = await api.get(`/hopitaux/catalogue/services?categorie=Plateau technique&limit=50`);
      return data;
    },
  });

  const { mutate: add, isPending: adding } = useMutation({
    mutationFn: () => api.post(`/hopitaux/${structureId}/services`, {
      serviceId:        selected,
      prixConsultation: prix || null,
      modeConsultation: mode,
      estDisponible:    true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['imagerie-services']);
      setSelected(''); setPrix(''); setDelai('');
      toast.success('Examen d\'imagerie ajouté !');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (svcId) => api.delete(`/hopitaux/${structureId}/services/${svcId}`),
    onSuccess: () => { queryClient.invalidateQueries(['imagerie-services']); toast.success('Retiré.'); },
  });

  const services = myServices?.data || [];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Équipements & Examens d'imagerie</h1>

      {/* Ajouter examen imagerie */}
      <div className="card mb-6" style={{ borderTop: `3px solid ${THEME.primary}` }}>
        <h2 className="font-semibold text-gray-900 mb-4">Ajouter un examen d'imagerie</h2>
        <div className="space-y-3">
          {/* Sélection depuis catalogue */}
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Examen depuis le catalogue</label>
            <select value={selected} onChange={(e) => setSelected(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none">
              <option value="">Choisir un examen...</option>
              {(catalogue?.data || []).map((s) => (
                <option key={s.id} value={s.id}>{s.nom}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prix (FCFA)</label>
              <input type="number" placeholder="Ex: 15000" value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Délai résultat (h)</label>
              <input type="number" placeholder="Ex: 2" value={delai}
                onChange={(e) => setDelai(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Disponibilité</label>
              <select value={mode} onChange={(e) => setMode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                {MODES.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
              </select>
            </div>
          </div>

          <button onClick={() => add()} disabled={adding || !selected}
            className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors"
            style={{ backgroundColor: THEME.primary }}>
            <Plus size={15}/> {adding ? 'Ajout...' : 'Ajouter cet examen'}
          </button>
        </div>
      </div>

      {/* Liste */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ backgroundColor: THEME.light }}>
          <h2 className="font-semibold text-sm" style={{ color: THEME.primary }}>
            {services.length} examen(s) d'imagerie disponible(s)
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {services.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-10">Aucun examen d'imagerie renseigné.</p>
          ) : services.map((s) => (
            <div key={s.id} className="flex items-center gap-3 px-5 py-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900 truncate">{s.service?.nom}</p>
                <p className="text-xs text-gray-400">{s.modeConsultation?.replace('_', ' ')}</p>
              </div>
              {s.prixConsultation && (
                <span className="text-sm font-bold shrink-0" style={{ color: THEME.primary }}>
                  {s.prixConsultation.toLocaleString()} F
                </span>
              )}
              <button onClick={() => remove(s.service?.id)}
                className="p-1.5 text-red-300 hover:text-red-500 rounded-lg transition-colors shrink-0">
                <Trash2 size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
