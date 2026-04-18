// src/pages/admin/AdminDashboard.jsx
import { useQuery } from '@tanstack/react-query';
import api from '../../utils/api';

export default function AdminDashboard() {
  const { data } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => { const { data } = await api.get('/admin/dashboard'); return data; },
  });

  const stats = [
    { label: 'Structures',           value: data?.totalStructures    ?? '…', color: 'text-primary-600' },
    { label: 'Dont Premium',         value: data?.structuresPremium  ?? '…', color: 'text-amber-600' },
    { label: 'Publications',         value: data?.totalPosts         ?? '…', color: 'text-purple-600' },
    { label: 'Médicaments',          value: data?.totalMedicaments   ?? '…', color: 'text-green-600' },
    { label: 'Examens',              value: data?.totalExamens       ?? '…', color: 'text-blue-600' },
    { label: 'Posts en attente',     value: data?.postEnAttente      ?? '…', color: 'text-red-500' },
    { label: "Inscrits aujourd'hui", value: data?.inscriptionsAujourdhui ?? '…', color: 'text-teal-600' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Tableau de bord Admin</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="card">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
      {data?.parType && (
        <div className="card">
          <h2 className="font-semibold text-gray-900 mb-4">Structures par type</h2>
          <div className="space-y-2">
            {data.parType.map((t) => (
              <div key={t.typeStructure} className="flex items-center justify-between py-1">
                <span className="text-sm text-gray-700">{t.typeStructure}</span>
                <span className="font-semibold text-primary-600">{t._count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
