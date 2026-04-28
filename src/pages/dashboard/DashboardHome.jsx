// src/pages/dashboard/DashboardHome.jsx — Corrigé (Horaires + Modules)
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, Clock, Eye, EyeOff, ArrowRight } from 'lucide-react';
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

// ✅ Correction 1 : Lecture des modules via structure.modules (injecté par le backend)
function computeActiveModules(structure) {
  const t = structure?.typeStructure || '';
  const def = MODULES_PAR_DEFAUT[t] || {};
  
  // On récupère les modules sauvegardés (déjà un objet grâce au backend)
  const saved = structure?.modules || {};

  return {
    medicaments: def.medicaments === true || saved.medicaments === true,
    examens:     def.examens     === true || saved.examens     === true,
    services:    def.services    === true || saved.services    === true,
    assurance:   saved.assurance === true,
  };
}

export default function DashboardHome() {
  const { user }      = useAuthStore();
  const structure     = user?.structure;
  const typeStructure = structure?.typeStructure || '';
  const theme         = STRUCTURE_THEMES[typeStructure] || { couleur:'#0284c7', couleurClair:'#e0f2fe', icone:'🏥', label:'Structure' };
  const isVerified    = structure?.isVerified;
  const info          = QUICK_INFOS[typeStructure] || { titre:'Bienvenue', desc:'Complétez votre profil.' };
  const modules       = computeActiveModules(structure);

  const { data: posts } = useQuery({
    queryKey: ['my-posts-count', structure?.id],
    queryFn: async () => {
      const { data } = await api.get(`/posts?structureId=${structure?.id}&limit=1`);
      return data;
    },
    enabled: !!structure?.id,
  });

  // Actions rapides
  const actions = [
    modules.medicaments && { to:'/dashboard/pharmacie',   label:'Gérer mes médicaments',    emoji:'💊' },
    modules.examens && typeStructure === 'CENTRE_IMAGERIE' && { to:'/dashboard/imagerie',    label:'Gérer l\'imagerie',            emoji:'🩻' },
    modules.examens && typeStructure === 'LABO_ET_IMAGERIE' && { to:'/dashboard/laboratoire', label:'Gérer mes examens',            emoji:'🔬' },
    modules.examens && typeStructure === 'LABO_ET_IMAGERIE' && { to:'/dashboard/imagerie',    label:'Gérer l\'imagerie',            emoji:'🩻' },
    modules.examens && !['CENTRE_IMAGERIE','LABO_ET_IMAGERIE'].includes(typeStructure) && { to:'/dashboard/laboratoire', label:'Gérer mes examens', emoji:'🔬' },
    modules.services && { to:'/dashboard/hopital',        label:'Gérer mes services',         emoji:'🏥' },
    modules.assurance && { to:'/dashboard/assurances',    label:'Gérer mes assurances',       emoji:'🛡️' },
    { to:'/dashboard/posts',                               label:'Publier une actualité',      emoji:'📰' },
    { to:'/dashboard/profil',                              label:'Compléter mon profil',       emoji:'✏️' },
  ].filter(Boolean);

  // ✅ Correction 2 : Transformation de l'objet horaires en TEXTE pour éviter le crash React #31
  const horairesText = (function() {
    const h = structure?.horaires;
    if (!h) return null;
    
    // Si c'est un objet (format JSON Prisma)
    if (typeof h === 'object' && !Array.isArray(h)) {
      if (h.ouverture && h.fermeture) {
        return `${h.ouverture} – ${h.fermeture}${h.jours ? ` (${h.jours})` : ''}`;
      }
      return null;
    }
    
    // Si c'est déjà du texte ou les anciens champs
    if (typeof h === 'string') return h;
    if (structure?.heureOuverture) return `${structure.heureOuverture} – ${structure.heureFermeture}`;
    
    return null;
  })();

  return (
    <div>
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

      {/* Statut vérification */}
      {isVerified ? (
        <div className="rounded-2xl p-4 flex items-start gap-4 mb-6 border-2 border-green-200 bg-green-50">
          <CheckCircle size={24} className="text-green-500 shrink-0 mt-0.5"/>
          <div>
            <p className="font-bold text-green-800">✓ Établissement vérifié — Visible sur AZAMED</p>
            <p className="text-green-700 text-sm mt-0.5 leading-relaxed">
              Votre {theme.label.toLowerCase()} est visible par tous les patients sur le site public et l'application mobile.
            </p>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl p-4 flex items-start gap-4 mb-6 border-2 border-orange-200 bg-orange-50">
          <Clock size={24} className="text-orange-500 shrink-0 mt-0.5"/>
          <div>
            <p className="font-bold text-orange-800">⏳ Vérification en attente</p>
            <p className="text-orange-700 text-sm mt-0.5 leading-relaxed">
              Votre {theme.label.toLowerCase()} est en cours de vérification.
            </p>
            <div className="flex items-center gap-1.5 mt-2 bg-orange-100 rounded-lg px-2.5 py-1 w-fit">
              <EyeOff size={11} className="text-orange-500"/>
              <span className="text-xs text-orange-700 font-medium">Non visible pour l'instant</span>
            </div>
          </div>
        </div>
      )}

      {/* Info contextuelle */}
      <div className="rounded-2xl p-4 mb-6 border" style={{ backgroundColor: theme.couleurClair, borderColor: theme.couleur + '30' }}>
        <p className="font-semibold text-sm mb-1" style={{ color: theme.couleur }}>
          💡 {info.titre}
        </p>
        <p className="text-gray-600 text-xs leading-relaxed">{info.desc}</p>
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