// src/pages/dashboard/DashboardLaboratoire.jsx — couleur bordeaux
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Search } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const THEME = { primary: '#7b2d42', light: '#fdf2f5', border: '#e8b4c0' }; // bordeaux

export default function DashboardLaboratoire() {
  const { user }    = useAuthStore();
  const structureId = user?.structure?.id;
  const queryClient = useQueryClient();

  const [exSearch, setExSearch]     = useState('');
  const [selectedEx, setSelectedEx] = useState(null);
  const [prix, setPrix]             = useState('');
  const [delaiMax, setDelaiMax]     = useState('');
  const [searchMy, setSearchMy]     = useState('');

  const { data: myExamens } = useQuery({
    queryKey: ['labo-examens', structureId, searchMy],
    queryFn: async () => {
      const { data } = await api.get(`/laboratoires/${structureId}/examens`);
      return data;
    },
    enabled: !!structureId,
  });

  const { data: catalogue } = useQuery({
    queryKey: ['catalogue-examens', exSearch],
    queryFn: async () => {
      const { data } = await api.get(`/laboratoires/catalogue/examens?search=${exSearch}&limit=8`);
      return data;
    },
    enabled: exSearch.length >= 2,
  });

  const { mutate: addExamen, isPending: adding } = useMutation({
    mutationFn: () => api.post(`/laboratoires/${structureId}/examens`, {
      examenId: selectedEx.id,
      prix: prix || null,
      delaiMax: delaiMax ? parseInt(delaiMax) : null,
      estDisponible: true,
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['labo-examens']);
      setSelectedEx(null); setPrix(''); setDelaiMax(''); setExSearch('');
      toast.success('Examen ajouté !');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: deleteExamen } = useMutation({
    mutationFn: (exId) => api.delete(`/laboratoires/${structureId}/examens/${exId}`),
    onSuccess: () => { queryClient.invalidateQueries(['labo-examens']); toast.success('Examen retiré.'); },
  });

  const examens = myExamens?.data || [];
  const grouped = myExamens?.grouped || {};

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Examens disponibles</h1>

      {/* Ajouter examen */}
      <div className="card mb-6" style={{ borderTop: `3px solid ${THEME.primary}` }}>
        <h2 className="font-semibold text-gray-900 mb-3">Ajouter un examen</h2>

        <div className="relative mb-2">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input type="text" placeholder="Rechercher dans le catalogue AZAMED..."
            value={exSearch} onChange={(e) => setExSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
        </div>

        {catalogue?.data?.length > 0 && !selectedEx && (
          <div className="border border-gray-100 rounded-xl overflow-hidden mb-3">
            {catalogue.data.map((ex) => (
              <button key={ex.id} onClick={() => { setSelectedEx(ex); setExSearch(''); }}
                className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-50 last:border-0 transition-colors">
                <p className="font-medium text-sm text-gray-900">{ex.nom}</p>
                <p className="text-xs text-gray-400">{ex.codeAzamed} · {ex.categorie}</p>
              </button>
            ))}
          </div>
        )}

        {selectedEx && (
          <div className="rounded-xl p-3 mb-3 flex items-center gap-3" style={{ backgroundColor: THEME.light, border: `1px solid ${THEME.border}` }}>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">{selectedEx.nom}</p>
              <p className="text-xs text-gray-500">{selectedEx.codeAzamed} · {selectedEx.categorie}</p>
            </div>
            <button onClick={() => setSelectedEx(null)} className="text-xs text-gray-400 hover:text-gray-600">✕</button>
          </div>
        )}

        {selectedEx && (
          <div className="flex gap-3 items-end flex-wrap">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Prix (FCFA)</label>
              <input type="number" placeholder="Optionnel" value={prix}
                onChange={(e) => setPrix(e.target.value)}
                className="w-32 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Délai résultat (h)</label>
              <input type="number" placeholder="Ex: 24" value={delaiMax}
                onChange={(e) => setDelaiMax(e.target.value)}
                className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>
            <button onClick={() => addExamen()} disabled={adding}
              className="px-4 py-2 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
              style={{ backgroundColor: THEME.primary }}>
              {adding ? '...' : 'Ajouter'}
            </button>
          </div>
        )}
      </div>

      {/* Liste examens groupés */}
      <div className="card p-0 overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100" style={{ backgroundColor: THEME.light }}>
          <h2 className="font-semibold text-sm" style={{ color: THEME.primary }}>
            {examens.length} examen(s) référencé(s)
          </h2>
        </div>
        <div className="px-5 py-3">
          {examens.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aucun examen ajouté.</p>
          ) : Object.entries(grouped).map(([cat, items]) => (
            <div key={cat} className="mb-4">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2 px-2 py-1 rounded-lg" style={{ backgroundColor: THEME.light }}>
                {cat} ({items.length})
              </p>
              {items.map((e) => (
                <div key={e.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{e.examen.nom}</p>
                    <p className="text-xs text-gray-400">{e.examen.codeAzamed}</p>
                  </div>
                  {e.prix && <span className="text-sm font-bold shrink-0" style={{ color: THEME.primary }}>{e.prix.toLocaleString()} F</span>}
                  {e.delaiMax && <span className="text-xs text-gray-400 shrink-0">~{e.delaiMax}h</span>}
                  <button onClick={() => deleteExamen(e.examen.id)}
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
