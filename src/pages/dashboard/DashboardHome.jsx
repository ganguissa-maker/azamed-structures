// src/pages/dashboard/DashboardHome.jsx — Accueil avec statut vérification visible
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { CheckCircle, Clock, AlertCircle, Newspaper, Pill, TestTube2, Building2, Eye, ArrowRight } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function DashboardHome() {
  const { user } = useAuthStore();
  const structure = user?.structure;
  const isVerified = structure?.isVerified;

  const { data: posts } = useQuery({
    queryKey: ['my-posts-count', structure?.id],
    queryFn: async () => {
      const { data } = await api.get(`/posts?structureId=${structure?.id}&limit=1`);
      return data;
    },
    enabled: !!structure?.id,
  });

  const modules = [
    { to:'/dashboard/profil',      label:'Mon profil',      icon:<Building2 size={20}/>,  color:'bg-primary-50 text-primary-600' },
    { to:'/dashboard/pharmacie',   label:'Médicaments',     icon:<Pill size={20}/>,        color:'bg-green-50 text-green-600' },
    { to:'/dashboard/laboratoire', label:'Examens',         icon:<TestTube2 size={20}/>,   color:'bg-blue-50 text-blue-600' },
    { to:'/dashboard/hopital',     label:'Services',        icon:<Building2 size={20}/>,   color:'bg-purple-50 text-purple-600' },
    { to:'/dashboard/posts',       label:'Publications',    icon:<Newspaper size={20}/>,   color:'bg-orange-50 text-orange-600' },
  ];

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">
        Bonjour, <span className="text-primary-600">{structure?.nomCommercial}</span> 👋
      </h1>

      {/* ─── STATUT VÉRIFICATION — très visible ─── */}
      {isVerified ? (
        <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-5 flex items-start gap-4 mb-6">
          <CheckCircle size={28} className="text-green-500 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="font-bold text-green-800 text-base">✓ Établissement vérifié</p>
            <p className="text-green-700 text-sm mt-1 leading-relaxed">
              Votre établissement est vérifié et visible par les patients sur le site public AZAMED.
              Vos médicaments, examens et services sont accessibles à tous.
            </p>
            <div className="flex items-center gap-2 mt-3">
              <Eye size={14} className="text-green-600"/>
              <span className="text-green-700 text-xs font-medium">Visible sur le site public</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-5 flex items-start gap-4 mb-6">
          <Clock size={28} className="text-orange-500 shrink-0 mt-0.5"/>
          <div className="flex-1">
            <p className="font-bold text-orange-800 text-base">⏳ Vérification en attente</p>
            <p className="text-orange-700 text-sm mt-1 leading-relaxed">
              Votre compte est en cours de vérification par l'équipe AZAMED.
              Une fois validé, votre établissement sera visible par tous les patients.
            </p>
            <p className="text-orange-600 text-xs mt-2">
              Pour accélérer la vérification :{' '}
              <a href="mailto:contactazamed@gmail.com" className="font-bold underline hover:no-underline">
                contactazamed@gmail.com
              </a>
            </p>
            <div className="flex items-center gap-2 mt-3 bg-orange-100 rounded-lg px-3 py-1.5 w-fit">
              <AlertCircle size={13} className="text-orange-500"/>
              <span className="text-orange-700 text-xs font-medium">Non visible sur le site public pour l'instant</span>
            </div>
          </div>
        </div>
      )}

      {/* Stats rapides */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center">
          <p className="text-2xl font-bold text-primary-600">{posts?.pagination?.total || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Publications</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-gray-900">
            {isVerified ? <span className="text-green-500">✓</span> : <span className="text-orange-500">⏳</span>}
          </p>
          <p className="text-xs text-gray-500 mt-1">{isVerified ? 'Vérifié' : 'En attente'}</p>
        </div>
      </div>

      {/* Navigation modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {modules.map((m) => (
          <Link key={m.to} to={m.to}
            className="card flex items-center gap-4 hover:shadow-md transition-all hover:-translate-y-0.5 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${m.color}`}>
              {m.icon}
            </div>
            <span className="font-medium text-gray-900 flex-1">{m.label}</span>
            <ArrowRight size={16} className="text-gray-300 group-hover:text-primary-400 transition-colors"/>
          </Link>
        ))}
      </div>

      {/* Info si non vérifié */}
      {!isVerified && (
        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
          <p className="text-sm font-medium text-gray-700 mb-1">Complétez votre profil en attendant</p>
          <p className="text-xs text-gray-500">
            Renseignez vos médicaments, examens et services dès maintenant. Tout sera visible immédiatement après vérification.
          </p>
        </div>
      )}
    </div>
  );
}
