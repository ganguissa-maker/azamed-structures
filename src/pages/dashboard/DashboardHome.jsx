// src/pages/dashboard/DashboardHome.jsx — Bannière verte vérification + notifications
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle, Clock, Eye, EyeOff, ArrowRight,
  Bell, X, ShieldCheck,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { STRUCTURE_THEMES, MODULES_PAR_DEFAUT, QUESTIONS_ADDITIONNELLES } from '../../utils/structureThemes';
import api from '../../utils/api';

const QUICK_INFOS = {
  PHARMACIE:         { titre:'Vos médicaments en ligne',      desc:'Renseignez vos médicaments et prix pour être trouvé par les patients.' },
  LABORATOIRE:       { titre:'Vos examens en ligne',          desc:'Indiquez les examens que vous réalisez, les délais et les prix.' },
  CENTRE_IMAGERIE:   { titre:'Vos examens d\'imagerie',       desc:'Renseignez vos équipements disponibles (radio, scanner, IRM, écho).' },
  LABO_ET_IMAGERIE:  { titre:'Vos services en ligne',         desc:'Gérez vos examens biologiques et équipements d\'imagerie.' },
  HOPITAL_PUBLIC:    { titre:'Vos services hospitaliers',     desc:'Indiquez vos spécialités et services disponibles.' },
  POLYCLINIQUE:      { titre:'Vos spécialités en ligne',      desc:'Renseignez vos spécialités médicales et services.' },
  CLINIQUE:          { titre:'Vos services en ligne',         desc:'Indiquez vos services et spécialités disponibles.' },
  CABINET_MEDICAL:   { titre:'Vos consultations',             desc:'Renseignez vos horaires, spécialités et tarifs de consultation.' },
  CABINET_SPECIALISE:{ titre:'Votre spécialité en ligne',     desc:'Mettez en avant votre spécialité et consultations.' },
  CENTRE_SANTE:      { titre:'Vos services de santé',         desc:'Indiquez vos services et médicaments disponibles.' },
};

function computeActiveModules(structure) {
  const t   = structure?.typeStructure || '';
  const def = MODULES_PAR_DEFAUT[t] || {};
  let saved = {};
  try { saved = JSON.parse(structure?.modulesJson || structure?.modules_json || '{}'); } catch {}
  // Aussi lire depuis structure.modules si injecté par le login
  const m = structure?.modules || saved;
  return {
    medicaments: def.medicaments === true || m.medicaments === true,
    examens:     def.examens     === true || m.examens     === true,
    services:    def.services    === true || m.services    === true,
    assurance:   m.assurance === true,
  };
}

// ─── Composant notification vérification ─────────────────────
function NotificationVerification({ notif, onClose, theme }) {
  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-full animate-slide-in">
      <div className="bg-white rounded-2xl shadow-2xl border-2 border-green-200 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <ShieldCheck size={22} className="text-green-500"/>
          </div>
          <div className="flex-1">
            <p className="font-bold text-gray-900 text-sm">{notif.titre}</p>
            <p className="text-gray-600 text-xs mt-1 leading-relaxed">{notif.message}</p>
          </div>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 shrink-0">
            <X size={16}/>
          </button>
        </div>
        <button onClick={onClose}
          className="mt-3 w-full py-2 rounded-xl text-sm font-semibold text-white transition-colors"
          style={{ backgroundColor: theme.couleur }}>
          Super, merci ! 🎉
        </button>
      </div>
    </div>
  );
}

export default function DashboardHome() {
  const { user, updateStructure } = useAuthStore();
  const structure     = user?.structure;
  const typeStructure = structure?.typeStructure || '';
  const theme         = STRUCTURE_THEMES[typeStructure] || { couleur:'#0284c7', couleurClair:'#e0f2fe', icone:'🏥', label:'Structure' };
  const modules       = computeActiveModules(structure);
  const info          = QUICK_INFOS[typeStructure] || { titre:'Bienvenue', desc:'Complétez votre profil.' };

  const [showNotif, setShowNotif] = useState(null);
  const [wasVerified, setWasVerified] = useState(structure?.isVerified || false);

  // ✅ Polling toutes les 30s pour détecter la vérification
  const { data: notifData } = useQuery({
    queryKey: ['mes-notifications'],
    queryFn: async () => {
      const { data } = await api.get('/notifications');
      return data;
    },
    refetchInterval: 30000, // toutes les 30 secondes
  });

  // ✅ Vérifier si une nouvelle notif de vérification est arrivée
  useEffect(() => {
    if (!notifData?.data) return;
    const verif = notifData.data.find((n) => n.type === 'VERIFICATION' && !n.isRead);
    if (verif) {
      setShowNotif(verif);
      // Marquer comme lue
      api.put(`/notifications/${verif.id}/lire`).catch(() => {});
    }
  }, [notifData]);

  // ✅ Recharger le profil toutes les 60s pour mettre à jour isVerified
  useQuery({
    queryKey: ['refresh-structure'],
    queryFn: async () => {
      const { data } = await api.get('/structures/me/profil');
      if (data && updateStructure) {
        updateStructure({ ...structure, ...data });
      }
      return data;
    },
    refetchInterval: 60000,
    enabled: !structure?.isVerified, // arrêter une fois vérifié
  });

  const { data: posts } = useQuery({
    queryKey: ['my-posts-count', structure?.id],
    queryFn: async () => {
      const { data } = await api.get(`/posts?structureId=${structure?.id}&limit=1`);
      return data;
    },
    enabled: !!structure?.id,
  });

  const isVerified = structure?.isVerified;

  // Actions rapides selon modules
  const actions = [
    modules.medicaments && { to:'/dashboard/pharmacie',   label:'Gérer mes médicaments',  emoji:'💊' },
    modules.examens && typeStructure === 'CENTRE_IMAGERIE' && { to:'/dashboard/imagerie',  label:'Gérer l\'imagerie',        emoji:'🩻' },
    modules.examens && typeStructure === 'LABO_ET_IMAGERIE' && { to:'/dashboard/laboratoire', label:'Gérer mes examens',     emoji:'🔬' },
    modules.examens && typeStructure === 'LABO_ET_IMAGERIE' && { to:'/dashboard/imagerie',    label:'Gérer l\'imagerie',     emoji:'🩻' },
    modules.examens && !['CENTRE_IMAGERIE','LABO_ET_IMAGERIE'].includes(typeStructure) && { to:'/dashboard/laboratoire', label:'Gérer mes examens', emoji:'🔬' },
    modules.services  && { to:'/dashboard/hopital',       label:'Gérer mes services',     emoji:'🏥' },
    modules.assurance && { to:'/dashboard/assurances',    label:'Gérer mes assurances',   emoji:'🛡️' },
    { to:'/dashboard/posts',                               label:'Publier une actualité',  emoji:'📰' },
    { to:'/dashboard/profil',                              label:'Compléter mon profil',   emoji:'✏️' },
  ].filter(Boolean);

  const horairesText = structure?.horaires
    ? (typeof structure.horaires === 'object'
        ? (structure.horaires.mode || Object.entries(structure.horaires.jours || {}).map(([j, h]) => `${j.slice(0,3)} ${h.debut}-${h.fin}`).join(', '))
        : structure.horaires)
    : null;

  return (
    <div className="relative">
      {/* ✅ Notification popup vérification */}
      {showNotif && (
        <NotificationVerification
          notif={showNotif}
          theme={theme}
          onClose={() => setShowNotif(null)}
        />
      )}

      {/* Bannière */}
      <div className="rounded-2xl p-6 mb-6 text-white relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${theme.couleur}, ${theme.couleur}cc)` }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-7xl opacity-20 select-none">{theme.icone}</div>
        <p className="text-white/70 text-sm mb-1">{theme.label}</p>
        <h1 className="text-xl font-bold text-white mb-1">
          Bonjour, {structure?.nomCommercial || structure?.nomLegal} 👋
        </h1>
        {(structure?.ville || horairesText) && (
          <p className="text-white/70 text-sm">
            {structure?.ville}
            {horairesText && <span className="ml-2">· {horairesText}</span>}
          </p>
        )}
      </div>

      {/* ✅ Statut vérification — très visible */}
      {isVerified ? (
        <div className="rounded-2xl p-5 flex items-start gap-4 mb-6 border-2 border-green-300 bg-green-50 shadow-sm">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <CheckCircle size={28} className="text-green-500"/>
          </div>
          <div className="flex-1">
            <p className="font-bold text-green-800 text-base">✅ Établissement vérifié par AZAMED</p>
            <p className="text-green-700 text-sm mt-1 leading-relaxed">
              Votre {theme.label.toLowerCase()} est désormais <strong>visible par tous les patients</strong> sur le site public AZAMED et l'application mobile. Tous vos médicaments, examens et services renseignés sont accessibles.
            </p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                <Eye size={12}/> Visible sur le site public
              </span>
              <span className="flex items-center gap-1.5 bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full">
                <ShieldCheck size={12}/> Compte certifié
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-5 flex items-start gap-4 mb-6 border-2 border-orange-200 bg-orange-50">
          <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
            <Clock size={28} className="text-orange-500"/>
          </div>
          <div className="flex-1">
            <p className="font-bold text-orange-800 text-base">⏳ Vérification en cours</p>
            <p className="text-orange-700 text-sm mt-1 leading-relaxed">
              Votre {theme.label.toLowerCase()} est en cours de vérification par l'équipe AZAMED.
              Une fois validé, il sera immédiatement visible par tous les patients.
            </p>
            <p className="text-orange-600 text-xs mt-2">
              Pour accélérer :{' '}
              <a href="mailto:contactazamed@gmail.com" className="font-bold underline">
                contactazamed@gmail.com
              </a>
            </p>
            <div className="flex items-center gap-1.5 mt-2 bg-orange-100 rounded-lg px-3 py-1.5 w-fit">
              <EyeOff size={11} className="text-orange-500"/>
              <span className="text-xs text-orange-700 font-medium">Non visible pour l'instant</span>
            </div>
          </div>
        </div>
      )}

      {/* Info contextuelle */}
      <div className="rounded-2xl p-4 mb-6 border" style={{ backgroundColor: theme.couleurClair, borderColor: theme.couleur + '30' }}>
        <p className="font-semibold text-sm mb-1" style={{ color: theme.couleur }}>💡 {info.titre}</p>
        <p className="text-gray-600 text-xs leading-relaxed">{info.desc}</p>
        {!isVerified && (
          <p className="text-xs text-gray-500 mt-2 italic">
            💡 Vous pouvez déjà renseigner toutes vos informations (médicaments, examens, services). Elles seront visibles dès la validation de votre compte.
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="card text-center py-4">
          <p className="text-2xl font-bold" style={{ color: theme.couleur }}>
            {posts?.pagination?.total || 0}
          </p>
          <p className="text-xs text-gray-500 mt-1">Publications</p>
        </div>
        <div className="card text-center py-4">
          <p className="text-2xl font-bold" style={{ color: isVerified ? '#16a34a' : '#f59e0b' }}>
            {isVerified ? '✓' : '⏳'}
          </p>
          <p className="text-xs text-gray-500 mt-1">{isVerified ? 'Vérifié' : 'En attente'}</p>
        </div>
      </div>

      {/* Actions rapides */}
      <h2 className="font-bold text-gray-900 mb-3 text-sm uppercase tracking-wider">Actions rapides</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {actions.map((item) => (
          <Link key={item.to + item.label} to={item.to}
            className="card flex items-center gap-3 hover:shadow-md transition-all hover:-translate-y-0.5 group py-3.5">
            <span className="text-xl">{item.emoji}</span>
            <span className="font-medium text-gray-900 flex-1 text-sm">{item.label}</span>
            <ArrowRight size={15} className="text-gray-300 group-hover:translate-x-0.5 transition-transform"
              style={{ color: theme.couleur + '80' }}/>
          </Link>
        ))}
      </div>
    </div>
  );
}
