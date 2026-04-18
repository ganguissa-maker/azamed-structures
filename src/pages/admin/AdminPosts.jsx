// src/pages/admin/AdminPosts.jsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from '../../components/ui/Toaster';
import api from '../../utils/api';

export default function AdminPosts() {
  const queryClient = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-posts'],
    queryFn: async () => { const { data } = await api.get('/admin/posts?status=all&limit=30'); return data; },
  });

  const { mutate: moderer } = useMutation({
    mutationFn: ({ id, action }) => api.put(`/admin/posts/${id}/moderer`, { action }),
    onSuccess: ({ data }) => { queryClient.invalidateQueries(['admin-posts']); toast.success(data.message); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Modération des publications</h1>
      <div className="space-y-3">
        {data?.data?.map((post) => (
          <div key={post.id} className="card">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="font-semibold text-sm text-gray-900">{post.structure?.nomCommercial}</span>
                  <span className="text-xs text-gray-400">
                    {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                  {!post.isApproved && (
                    <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">En attente</span>
                  )}
                </div>
                <p className="text-sm text-gray-700 line-clamp-2">{post.contenu}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                {!post.isApproved && (
                  <button onClick={() => moderer({ id: post.id, action: 'approuver' })}
                    className="p-1.5 text-green-500 hover:bg-green-50 rounded-lg"><CheckCircle size={16}/></button>
                )}
                <button onClick={() => moderer({ id: post.id, action: 'rejeter' })}
                  className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg"><XCircle size={16}/></button>
              </div>
            </div>
          </div>
        ))}
        {(!data?.data || data.data.length === 0) && (
          <p className="text-center text-gray-400 py-12">Aucune publication.</p>
        )}
      </div>
    </div>
  );
}
