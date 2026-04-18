// src/pages/admin/AdminStructures.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import api from '../../utils/api';

export default function AdminStructures() {
  const [search, setSearch] = useState('');
  const [page, setPage]     = useState(1);
  const queryClient         = useQueryClient();

  const { data } = useQuery({
    queryKey: ['admin-structures', search, page],
    queryFn: async () => {
      const p = new URLSearchParams({ page, limit: 20 });
      if (search) p.set('search', search);
      const { data } = await api.get(`/admin/structures?${p}`);
      return data;
    },
  });

  const { mutate: toggle } = useMutation({
    mutationFn: (id) => api.put(`/admin/structures/${id}/suspendre`),
    onSuccess: ({ data }) => { queryClient.invalidateQueries(['admin-structures']); toast.success(data.message); },
  });

  const { mutate: verify } = useMutation({
    mutationFn: (id) => api.put(`/admin/structures/${id}/verifier`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-structures']); toast.success('Structure vérifiée.'); },
  });

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Gestion des structures</h1>
      <input type="text" placeholder="Rechercher par nom, email..." value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-4 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 w-72" />

      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100">
              {['Nom','Type','Ville','Abonnement','Statut','Actions'].map((h) => (
                <th key={h} className="text-left py-3 px-2 font-semibold text-gray-600 text-xs uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.data?.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 hover:bg-gray-50">
                <td className="py-3 px-2">
                  <p className="font-medium text-gray-900 truncate max-w-[180px]">{s.nomCommercial}</p>
                  <p className="text-xs text-gray-400">{s.user?.email}</p>
                </td>
                <td className="py-3 px-2 text-xs text-gray-500">{s.typeStructure}</td>
                <td className="py-3 px-2 text-gray-600">{s.ville}</td>
                <td className="py-3 px-2">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                    s.abonnements?.[0]?.niveau === 'PREMIUM2' ? 'bg-amber-100 text-amber-700' :
                    s.abonnements?.[0]?.niveau === 'PREMIUM1' ? 'bg-purple-100 text-purple-700' :
                    'bg-gray-100 text-gray-500'}`}>
                    {s.abonnements?.[0]?.niveau || 'BASIC'}
                  </span>
                </td>
                <td className="py-3 px-2">
                  {s.isActive
                    ? <span className="text-xs text-green-600 flex items-center gap-1"><CheckCircle size={12}/>Actif</span>
                    : <span className="text-xs text-red-500 flex items-center gap-1"><XCircle size={12}/>Suspendu</span>}
                </td>
                <td className="py-3 px-2">
                  <div className="flex gap-1">
                    {!s.isVerified && (
                      <button onClick={() => verify(s.id)} title="Vérifier"
                        className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg">
                        <ShieldCheck size={14} />
                      </button>
                    )}
                    <button onClick={() => toggle(s.id)}
                      className={`p-1.5 rounded-lg ${s.isActive ? 'text-red-400 hover:bg-red-50' : 'text-green-500 hover:bg-green-50'}`}>
                      {s.isActive ? <XCircle size={14}/> : <CheckCircle size={14}/>}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data?.pagination?.pages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button disabled={page === 1} onClick={() => setPage(p => p-1)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50">← Préc.</button>
          <span className="px-4 py-2 text-sm text-gray-600">Page {page} / {data.pagination.pages}</span>
          <button disabled={page >= data.pagination.pages} onClick={() => setPage(p => p+1)}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm disabled:opacity-40 hover:bg-gray-50">Suiv. →</button>
        </div>
      )}
    </div>
  );
}
