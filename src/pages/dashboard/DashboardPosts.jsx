// src/pages/dashboard/DashboardPosts.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const TYPES = ['NOUVEAU_SERVICE','PROMOTION','DISPONIBILITE_MEDICAMENT','NOUVEL_EXAMEN','CAMPAGNE_DEPISTAGE','HORAIRES_MODIFIES','EVENEMENT_MEDICAL','RECRUTEMENT','MESSAGE_INSTITUTIONNEL','AUTRE'];
const LABELS = { NOUVEAU_SERVICE:'Nouveau service', PROMOTION:'Promotion', DISPONIBILITE_MEDICAMENT:'Médicament dispo', NOUVEL_EXAMEN:'Nouvel examen', CAMPAGNE_DEPISTAGE:'Campagne dépistage', HORAIRES_MODIFIES:'Horaires modifiés', EVENEMENT_MEDICAL:'Événement médical', RECRUTEMENT:'Recrutement', MESSAGE_INSTITUTIONNEL:'Message officiel', AUTRE:'Autre' };

export default function DashboardPosts() {
  const { user }    = useAuthStore();
  const structureId = user?.structure?.id;
  const niveau      = user?.structure?.abonnements?.[0]?.niveau || 'BASIC';
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ contenu: '', typePost: 'AUTRE' });

  const { data: posts } = useQuery({
    queryKey: ['my-posts', structureId],
    queryFn: async () => { const { data } = await api.get(`/posts?structureId=${structureId}&limit=20`); return data; },
    enabled: !!structureId,
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: () => api.post('/posts', form),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-posts']);
      setForm({ contenu: '', typePost: 'AUTRE' });
      toast.success('Publication créée !');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const { mutate: remove } = useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['my-posts']); toast.success('Post supprimé.'); },
  });

  const { mutate: pin } = useMutation({
    mutationFn: (id) => api.put(`/posts/${id}/epingler`),
    onSuccess: () => queryClient.invalidateQueries(['my-posts']),
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const LIMITE = { BASIC: '1 / semaine', PREMIUM1: '2 / jour', PREMIUM2: '5 / jour' };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Publications</h1>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Limite : {LIMITE[niveau]}
        </span>
      </div>

      {/* Créer un post */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Nouvelle publication</h2>
        <div className="space-y-3">
          <select value={form.typePost} onChange={(e) => setForm({ ...form, typePost: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
            {TYPES.map((t) => <option key={t} value={t}>{LABELS[t]}</option>)}
          </select>
          <textarea value={form.contenu} onChange={(e) => setForm({ ...form, contenu: e.target.value })}
            rows={4} placeholder="Rédigez votre publication (minimum 10 caractères)..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 resize-none" />
          <button onClick={() => create()} disabled={isPending || form.contenu.length < 10}
            className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
            {isPending ? 'Publication en cours...' : 'Publier'}
          </button>
        </div>
      </div>

      {/* Liste des posts */}
      <div className="space-y-3">
        {posts?.data?.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{LABELS[post.typePost]}</span>
                  {post.isPinned && <Pin size={12} className="text-amber-500" />}
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                <p className="text-sm text-gray-800 whitespace-pre-line">{post.contenu}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {niveau === 'PREMIUM2' && (
                  <button onClick={() => pin(post.id)} title={post.isPinned ? 'Désépingler' : 'Épingler'}
                    className={`p-1.5 rounded-lg transition-colors ${post.isPinned ? 'text-amber-500 bg-amber-50' : 'text-gray-400 hover:bg-gray-50'}`}>
                    <Pin size={14} />
                  </button>
                )}
                <button onClick={() => remove(post.id)}
                  className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
        {(!posts?.data || posts.data.length === 0) && (
          <p className="text-center text-sm text-gray-400 py-8">Aucune publication. Créez votre première actualité !</p>
        )}
      </div>
    </div>
  );
}
