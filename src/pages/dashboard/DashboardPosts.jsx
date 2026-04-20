// src/pages/dashboard/DashboardPosts.jsx — avec upload images et vidéos
import { useState, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Trash2, Pin, Image, Video, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const TYPES = [
  'NOUVEAU_SERVICE','PROMOTION','DISPONIBILITE_MEDICAMENT','NOUVEL_EXAMEN',
  'CAMPAGNE_DEPISTAGE','HORAIRES_MODIFIES','EVENEMENT_MEDICAL',
  'RECRUTEMENT','MESSAGE_INSTITUTIONNEL','AUTRE',
];
const LABELS = {
  NOUVEAU_SERVICE:'Nouveau service', PROMOTION:'Promotion',
  DISPONIBILITE_MEDICAMENT:'Médicament dispo', NOUVEL_EXAMEN:'Nouvel examen',
  CAMPAGNE_DEPISTAGE:'Campagne dépistage', HORAIRES_MODIFIES:'Horaires modifiés',
  EVENEMENT_MEDICAL:'Événement médical', RECRUTEMENT:'Recrutement',
  MESSAGE_INSTITUTIONNEL:'Message officiel', AUTRE:'Autre',
};

export default function DashboardPosts() {
  const { user }    = useAuthStore();
  const structureId = user?.structure?.id;
  const queryClient = useQueryClient();

  const [contenu, setContenu]   = useState('');
  const [typePost, setTypePost] = useState('AUTRE');
  const [mediaFile, setMediaFile]       = useState(null);
  const [mediaPreview, setMediaPreview] = useState(null);
  const [mediaType, setMediaType]       = useState('');
  const fileRef = useRef(null);

  const { data: posts } = useQuery({
    queryKey: ['my-posts', structureId],
    queryFn: async () => {
      const { data } = await api.get(`/posts?structureId=${structureId}&limit=20`);
      return data;
    },
    enabled: !!structureId,
  });

  const { mutate: createPost, isPending } = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('contenu', contenu);
      formData.append('typePost', typePost);
      if (mediaFile) formData.append('media', mediaFile);
      return api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-posts']);
      setContenu(''); setTypePost('AUTRE');
      setMediaFile(null); setMediaPreview(null); setMediaType('');
      if (fileRef.current) fileRef.current.value = '';
      toast.success('Publication créée !');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur lors de la publication'),
  });

  const { mutate: deletePost } = useMutation({
    mutationFn: (id) => api.delete(`/posts/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-posts']);
      toast.success('Post supprimé.');
    },
  });

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast.error('Format non supporté. Images (JPG, PNG) et vidéos (MP4) uniquement.');
      return;
    }
    if (file.size > 50 * 1024 * 1024) {
      toast.error('Fichier trop lourd. Maximum 50 Mo.');
      return;
    }
    setMediaFile(file);
    setMediaType(isVideo ? 'video' : 'image');
    setMediaPreview(URL.createObjectURL(file));
  };

  const removeMedia = () => {
    setMediaFile(null); setMediaPreview(null); setMediaType('');
    if (fileRef.current) fileRef.current.value = '';
  };

  const LIMITE = { BASIC: '1 publication / semaine', PREMIUM1: '2 / jour', PREMIUM2: '5 / jour' };
  const niveau = user?.structure?.abonnements?.[0]?.niveau || 'BASIC';

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-gray-900">Publications</h1>
        <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          {LIMITE[niveau]}
        </span>
      </div>

      {/* Formulaire nouvelle publication */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Nouvelle publication</h2>
        <div className="space-y-3">
          {/* Type */}
          <select value={typePost} onChange={(e) => setTypePost(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
            {TYPES.map((t) => <option key={t} value={t}>{LABELS[t]}</option>)}
          </select>

          {/* Texte */}
          <textarea value={contenu} onChange={(e) => setContenu(e.target.value)} rows={4}
            placeholder="Rédigez votre publication (minimum 10 caractères)..."
            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 resize-none"/>

          {/* Prévisualisation média */}
          {mediaPreview && (
            <div className="relative inline-block">
              {mediaType === 'image'
                ? <img src={mediaPreview} alt="Prévisualisation" className="max-h-48 rounded-xl object-cover border border-gray-200"/>
                : <video src={mediaPreview} controls className="max-h-48 rounded-xl border border-gray-200"/>}
              <button onClick={removeMedia}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 shadow-md">
                <X size={12}/>
              </button>
              <p className="text-xs text-gray-400 mt-1">
                {mediaFile?.name} ({(mediaFile?.size / 1024 / 1024).toFixed(1)} Mo)
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/webm"
              onChange={handleFile} className="hidden" id="media-upload"/>
            <label htmlFor="media-upload"
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <Image size={15} className="text-blue-500"/> Ajouter une image
            </label>
            <label htmlFor="media-upload"
              className="flex items-center gap-1.5 px-3 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer">
              <Video size={15} className="text-purple-500"/> Ajouter une vidéo
            </label>
            <div className="flex-1"/>
            <button onClick={() => createPost()} disabled={isPending || contenu.length < 10}
              className="bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2">
              {isPending
                ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Publication...</>
                : 'Publier'}
            </button>
          </div>
        </div>
      </div>

      {/* Liste publications */}
      <div className="space-y-3">
        {posts?.data?.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                {/* Méta */}
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                    {LABELS[post.typePost]}
                  </span>
                  {post.isPinned && <Pin size={12} className="text-amber-500"/>}
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </div>
                {/* Texte */}
                <p className="text-sm text-gray-800 whitespace-pre-line mb-2">{post.contenu}</p>
                {/* Image */}
                {post.imageUrl && (
                  <img src={post.imageUrl} alt="" className="max-h-40 rounded-xl object-cover mb-2 cursor-pointer"
                    onClick={() => window.open(post.imageUrl, '_blank')}/>
                )}
                {/* Vidéo */}
                {post.videoUrl && (
                  <video src={post.videoUrl} controls className="max-h-40 rounded-xl mb-2 w-full"/>
                )}
              </div>
              {/* Supprimer */}
              <button onClick={() => deletePost(post.id)}
                className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Supprimer cette publication">
                <Trash2 size={14}/>
              </button>
            </div>
          </div>
        ))}

        {(!posts?.data || posts.data.length === 0) && (
          <div className="text-center py-12 text-gray-400">
            <p className="font-medium text-gray-500 mb-1">Aucune publication</p>
            <p className="text-sm">Créez votre première actualité pour informer vos patients.</p>
          </div>
        )}
      </div>
    </div>
  );
}
