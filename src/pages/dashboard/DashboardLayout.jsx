// src/pages/dashboard/DashboardLayout.jsx — navigation adaptée aux modules activés
import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, User, Pill, TestTube2, Building2,
  Newspaper, LogOut, Menu, X, ExternalLink, Mail,
  ShieldCheck, Clock, Scan, Shield,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { STRUCTURE_THEMES, MODULES_PAR_DEFAUT, QUESTIONS_ADDITIONNELLES } from '../../utils/structureThemes';

const PUBLIC_URL    = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';
const CONTACT_EMAIL = 'contactazamed@gmail.com';

// Calcule les modules actifs de la structure depuis ses données
function computeActiveModules(structure) {
  const typeStructure = structure?.typeStructure || '';
  const defaut        = MODULES_PAR_DEFAUT[typeStructure] || {};
  const questions     = QUESTIONS_ADDITIONNELLES[typeStructure] || [];

  // Lire les réponses sauvegardées dans le champ horaires ou description
  // On lit depuis structure.modules si présent, sinon on utilise les defaults
  const savedModules = structure?.modules || {};

  const active = {
    medicaments: defaut.medicaments || savedModules.medicaments || false,
    examens:     defaut.examens     || savedModules.examens     || false,
    services:    defaut.services    || savedModules.services    || false,
    assurance:   savedModules.assurance || false,
  };

  // Fallback: si structure est une pharmacie, toujours médicaments
  if (typeStructure === 'PHARMACIE') active.medicaments = true;
  if (['LABORATOIRE','CENTRE_IMAGERIE','LABO_ET_IMAGERIE'].includes(typeStructure)) active.examens = true;
  if (['HOPITAL_PUBLIC','POLYCLINIQUE','CLINIQUE','CABINET_MEDICAL','CABINET_SPECIALISE','CENTRE_SANTE'].includes(typeStructure)) active.services = true;

  return active;
}

function buildNavItems(typeStructure, activeModules) {
  const items = [
    { to:'/dashboard',        label:'Tableau de bord', icon:<LayoutDashboard size={17}/>, end:true },
    { to:'/dashboard/profil', label:'Mon profil',       icon:<User size={17}/> },
  ];

  if (activeModules.medicaments) {
    items.push({ to:'/dashboard/pharmacie',   label:'Médicaments',      icon:<Pill size={17}/> });
  }
  if (activeModules.examens) {
    // Distinguer labos des centres imagerie
    if (typeStructure === 'CENTRE_IMAGERIE') {
      items.push({ to:'/dashboard/imagerie',  label:'Imagerie',          icon:<Scan size={17}/> });
    } else if (typeStructure === 'LABO_ET_IMAGERIE') {
      items.push({ to:'/dashboard/laboratoire', label:'Examens',         icon:<TestTube2 size={17}/> });
      items.push({ to:'/dashboard/imagerie',    label:'Imagerie',        icon:<Scan size={17}/> });
    } else {
      items.push({ to:'/dashboard/laboratoire', label:'Examens',         icon:<TestTube2 size={17}/> });
    }
  }
  if (activeModules.services) {
    const label = typeStructure === 'CABINET_MEDICAL' || typeStructure === 'CABINET_SPECIALISE'
      ? 'Consultations' : 'Services médicaux';
    items.push({ to:'/dashboard/hopital', label, icon:<Building2 size={17}/> });
  }
  if (activeModules.assurance) {
    items.push({ to:'/dashboard/assurances', label:'Assurances',         icon:<Shield size={17}/> });
  }

  items.push({ to:'/dashboard/posts', label:'Publications', icon:<Newspaper size={17}/> });

  return items;
}

function Sidebar({ onClose }) {
  const { user, logout } = useAuthStore();
  const navigate          = useNavigate();
  const structure         = user?.structure;
  const typeStructure     = structure?.typeStructure || '';
  const theme             = STRUCTURE_THEMES[typeStructure] || { couleur:'#0284c7', couleurClair:'#e0f2fe', icone:'🏥', label:'Structure' };
  const activeModules     = computeActiveModules(structure);
  const navItems          = buildNavItems(typeStructure, activeModules);

  return (
    <div className="flex flex-col h-full bg-white">

      {/* Header coloré */}
      <div className="p-5 border-b border-gray-100 shrink-0"
        style={{ background: `linear-gradient(135deg, ${theme.couleur}, ${theme.couleur}dd)` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AZ</span>
            </div>
            <span className="font-bold text-white text-sm">AZAMED</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 text-white/70 hover:text-white rounded-lg">
              <X size={18}/>
            </button>
          )}
        </div>

        {/* Info structure */}
        <div className="bg-white/15 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{theme.icone}</span>
            <p className="font-bold text-white text-sm truncate flex-1">
              {structure?.nomCommercial || structure?.nomLegal}
            </p>
          </div>
          <p className="text-white/70 text-xs">{theme.label}</p>
          <div className="flex items-center gap-1.5 mt-2 flex-wrap">
            {structure?.isVerified
              ? <span className="flex items-center gap-1 text-xs bg-white/20 text-white px-2 py-0.5 rounded-full font-medium">
                  <ShieldCheck size={10}/> Vérifié
                </span>
              : <span className="flex items-center gap-1 text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">
                  <Clock size={10}/> En attente
                </span>}
            <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">Gratuit</span>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive ? 'text-white shadow-sm' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: theme.couleur } : {}}>
            {item.icon}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer sidebar */}
      <div className="p-3 border-t border-gray-100 shrink-0 space-y-1">
        <a href={PUBLIC_URL} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <ExternalLink size={14}/> Voir le site public
        </a>
        <a href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-50 transition-colors">
          <Mail size={14}/> Nous contacter
        </a>
        <button onClick={() => { logout(); navigate('/connexion'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
          <LogOut size={17}/> Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const typeStructure = user?.structure?.typeStructure || '';
  const theme = STRUCTURE_THEMES[typeStructure] || { couleur:'#0284c7', icone:'🏥' };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Sidebar desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-30 shadow-sm">
        <Sidebar/>
      </aside>

      {/* Sidebar mobile overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={() => setSidebarOpen(false)}/>
          <aside className="relative w-72 bg-white h-full z-50 shadow-2xl">
            <Sidebar onClose={() => setSidebarOpen(false)}/>
          </aside>
        </div>
      )}

      {/* Contenu principal */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">

        {/* Header mobile coloré */}
        <header className="md:hidden sticky top-0 z-20 shadow-sm shrink-0"
          style={{ backgroundColor: theme.couleur }}>
          <div className="flex items-center gap-3 px-4 py-3">
            <button onClick={() => setSidebarOpen(true)}
              className="p-1.5 text-white/80 hover:text-white rounded-lg">
              <Menu size={22}/>
            </button>
            <span className="text-lg">{theme.icone}</span>
            <span className="font-semibold text-white text-sm truncate flex-1">
              {user?.structure?.nomCommercial || user?.structure?.nomLegal}
            </span>
            {user?.structure?.isVerified
              ? <ShieldCheck size={16} className="text-white/80 shrink-0"/>
              : <Clock size={16} className="text-white/60 shrink-0"/>}
          </div>
        </header>

        {/* Page */}
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          <Outlet/>
        </main>

        {/* Footer */}
        <footer className="border-t border-gray-100 px-6 py-4 bg-white shrink-0">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} AZAMED — Plateforme santé Cameroun — Gratuit</span>
            <a href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-1.5 transition-colors hover:opacity-80"
              style={{ color: theme.couleur }}>
              <Mail size={11}/> {CONTACT_EMAIL}
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
