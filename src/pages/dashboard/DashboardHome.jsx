// src/pages/dashboard/DashboardHome.jsx
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { Eye, Phone, MessageCircle, BarChart2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function DashboardHome() {
  const { user }   = useAuthStore();
  const structure  = user?.structure;
  const niveau     = structure?.abonnements?.[0]?.niveau || 'BASIC';

  const { data: stats } = useQuery({
    queryKey: ['stats', structure?.id],
    queryFn: async () => { const { data } = await api.get(`/structures/${structure.id}/stats`); return data; },
    enabled: !!structure?.id,
  });

  const actions = [
    { label: 'Éditer mon profil',             to: '/dashboard/profil' },
    { label: 'Mettre à jour mes médicaments', to: '/dashboard/pharmacie' },
    { label: 'Gérer mes examens',             to: '/dashboard/laboratoire' },
    { label: 'Gérer mes services',            to: '/dashboard/hopital' },
    { label: 'Publier une actualité',         to: '/dashboard/posts' },
    { label: 'Voir mon abonnement',           to: '/dashboard/abonnement' },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Bonjour, {structure?.nomCommercial} 👋</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez votre présence sur AZAMED</p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
        <div className="card text-center">
          <Eye size={20} className="text-primary-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-gray-900">{stats?.vues7j ?? '—'}</p>
          <p className="text-xs text-gray-500">Vues (7 jours)</p>
        </div>
        {(niveau === 'PREMIUM1' || niveau === 'PREMIUM2') && (
          <>
            <div className="card text-center">
              <Phone size={20} className="text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.clicsAppel ?? '—'}</p>
              <p className="text-xs text-gray-500">Appels reçus</p>
            </div>
            <div className="card text-center">
              <MessageCircle size={20} className="text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-900">{stats?.clicsWhatsapp ?? '—'}</p>
              <p className="text-xs text-gray-500">Clics WhatsApp</p>
            </div>
          </>
        )}
      </div>

      {/* Actions rapides */}
      <div className="card mb-6">
        <h2 className="font-semibold text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {actions.map((a) => (
            <Link key={a.to} to={a.to}
              className="text-sm text-center py-3 px-4 bg-gray-50 rounded-xl hover:bg-primary-50 hover:text-primary-700 font-medium transition-colors text-gray-700">
              {a.label}
            </Link>
          ))}
        </div>
      </div>

      {/* CTA Premium */}
      {niveau === 'BASIC' && (
        <div className="bg-gradient-to-r from-primary-600 to-primary-500 text-white rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <BarChart2 size={20} />
            <h3 className="font-bold">Passez en Premium</h3>
          </div>
          <p className="text-sm text-primary-100 mb-4">
            Apparaissez en tête des résultats, publiez plus souvent et accédez aux statistiques détaillées.
          </p>
          <Link to="/dashboard/abonnement"
            className="bg-white text-primary-700 font-semibold text-sm px-4 py-2 rounded-lg hover:bg-primary-50 transition-colors inline-block">
            Voir les offres →
          </Link>
        </div>
      )}
    </div>
  );
}
