// src/pages/dashboard/DashboardAssurances.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Shield } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import { STRUCTURE_THEMES } from '../../utils/structureThemes';
import api from '../../utils/api';

const ASSURANCES_CAMEROUN = [
  'BEAC Assurances','Beneficial Life','CAAR','CAMPOST Vie',
  'Chanas Assurances','CNPS','GFA Cameroun','NSIA Cameroun',
  'Prudential Beneficial Life','SAAR','Saham Assurance Cameroun',
  'SOCAR','Zeniath Assurance',
];

export default function DashboardAssurances() {
  const { user }    = useAuthStore();
  const structureId = user?.structure?.id;
  const typeStructure = user?.structure?.typeStructure || '';
  const theme       = STRUCTURE_THEMES[typeStructure] || { couleur:'#0284c7', couleurClair:'#e0f2fe' };
  const queryClient = useQueryClient();

  const [selected, setSelected] = useState('');
  const [custom, setCustom]     = useState('');
  const [useCustom, setUseCustom] = useState(false);

  // Récupérer assurances depuis le backend
  const { data: myAssurances } = useQuery({
    queryKey: ['assurances', structureId],
    queryFn: async () => {
      const { data } = await api.get(`/structures/${structureId}/assurances`);
      return data;
    },
    enabled: !!structureId,
  });

  const { mutate: add, isPending: adding } = useMutation({
    mutationFn: () => {
      const nom = useCustom ? custom : selected;
      if (!nom) throw new Error('Sélectionnez ou saisissez une assurance.');
      return api.post(`/structures/${structureId}/assurances`, { nom });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['assurances']);
      setSelected(''); setCustom('');
      toast.success('Assurance ajoutée !');
    },
    onError: (e) => toast.error(e.message || e.response?.data?.error || 'Erreur'),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => api.delete(`/structures/${structureId}/assurances/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['assurances']); toast.success('Assurance retirée.'); },
  });

  const assurances = myAssurances?.data || [];

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: theme.couleurClair }}>
          <Shield size={20} style={{ color: theme.couleur }}/>
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Assurances partenaires</h1>
          <p className="text-gray-500 text-sm">Indiquez les assurances acceptées dans votre structure</p>
        </div>
      </div>

      {/* Ajouter */}
      <div className="card mb-6" style={{ borderTop: `3px solid ${theme.couleur}` }}>
        <h2 className="font-semibold text-gray-900 mb-4">Ajouter une assurance</h2>

        <div className="flex items-center gap-3 mb-3">
          <button type="button" onClick={() => setUseCustom(false)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium border transition-colors ${!useCustom ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            style={!useCustom ? { backgroundColor: theme.couleur } : {}}>
            Depuis la liste
          </button>
          <button type="button" onClick={() => setUseCustom(true)}
            className={`text-sm px-3 py-1.5 rounded-lg font-medium border transition-colors ${useCustom ? 'text-white border-transparent' : 'text-gray-600 border-gray-200 hover:bg-gray-50'}`}
            style={useCustom ? { backgroundColor: theme.couleur } : {}}>
            Saisir manuellement
          </button>
        </div>

        {!useCustom ? (
          <select value={selected} onChange={(e) => setSelected(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none mb-3">
            <option value="">Choisir une assurance...</option>
            {ASSURANCES_CAMEROUN.filter((a) => !assurances.find((x) => x.nom === a)).map((a) => (
              <option key={a} value={a}>{a}</option>
            ))}
          </select>
        ) : (
          <input type="text" placeholder="Nom de l'assurance..." value={custom}
            onChange={(e) => setCustom(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none mb-3"/>
        )}

        <button onClick={() => add()} disabled={adding || (!selected && !custom)}
          className="flex items-center gap-2 px-5 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-50"
          style={{ backgroundColor: theme.couleur }}>
          <Plus size={15}/> {adding ? 'Ajout...' : 'Ajouter cette assurance'}
        </button>
      </div>

      {/* Liste */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b" style={{ backgroundColor: theme.couleurClair }}>
          <h2 className="font-semibold text-sm" style={{ color: theme.couleur }}>
            {assurances.length} assurance(s) référencée(s)
          </h2>
        </div>
        <div className="divide-y divide-gray-50">
          {assurances.length === 0 ? (
            <div className="text-center py-10">
              <Shield size={32} className="mx-auto mb-2 opacity-20" style={{ color: theme.couleur }}/>
              <p className="text-sm text-gray-400">Aucune assurance renseignée.</p>
              <p className="text-xs text-gray-400 mt-1">Ajoutez les assurances que vous acceptez.</p>
            </div>
          ) : assurances.map((a) => (
            <div key={a.id} className="flex items-center gap-3 px-5 py-3.5">
              <Shield size={16} style={{ color: theme.couleur }} className="shrink-0"/>
              <span className="flex-1 text-sm font-medium text-gray-900">{a.nom}</span>
              <button onClick={() => remove(a.id)}
                className="p-1.5 text-red-300 hover:text-red-500 rounded-lg transition-colors">
                <Trash2 size={14}/>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
