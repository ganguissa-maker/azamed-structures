// src/pages/dashboard/DashboardLayout.jsx — avec contact email
import { useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  LayoutDashboard, User, Pill, TestTube2, Building2,
  Newspaper, LogOut, Menu, X, ExternalLink, Mail,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const PUBLIC_URL    = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';
const CONTACT_EMAIL = 'contactazamed@gmail.com';

const navItems = [
  { to:'/dashboard',            label:'Tableau de bord', icon:<LayoutDashboard size={18}/>, end:true },
  { to:'/dashboard/profil',     label:'Mon profil',       icon:<User size={18}/> },
  { to:'/dashboard/pharmacie',  label:'Médicaments',      icon:<Pill size={18}/> },
  { to:'/dashboard/laboratoire',label:'Examens',          icon:<TestTube2 size={18}/> },
  { to:'/dashboard/hopital',    label:'Services',         icon:<Building2 size={18}/> },
  { to:'/dashboard/posts',      label:'Publications',     icon:<Newspaper size={18}/> },
];

function Sidebar({ onClose }) {
  const { user, logout } = useAuthStore();
  const navigate          = useNavigate();
  const structure         = user?.structure;
  const estMedecin        = structure?.nomCommercial?.startsWith('Dr.');

  return (
    <div className="flex flex-col h-full">
      {/* Logo + structure */}
      <div className="p-5 border-b border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AZ</span>
            </div>
            <span className="font-bold text-primary-700 text-sm">AZAMED</span>
          </div>
          {onClose && (
            <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
              <X size={18}/>
            </button>
          )}
        </div>
        <p className="font-semibold text-gray-900 text-sm truncate">{structure?.nomCommercial}</p>
        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
          {estMedecin && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">Médecin</span>
          )}
          <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium">Gratuit</span>
          {structure?.isVerified && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary-100 text-primary-700 font-medium">✓ Vérifié</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end} onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive ? 'bg-primary-50 text-primary-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`
            }>
            {item.icon} {item.label}
          </NavLink>
        ))}
      </nav>

      {/* Footer sidebar */}
      <div className="p-3 border-t border-gray-100 space-y-1">
        {/* Lien site public */}
        <a href={PUBLIC_URL} target="_blank" rel="noreferrer"
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors">
          <ExternalLink size={15}/> Voir le site public
        </a>

        {/* Contact email */}
        <a href={`mailto:${CONTACT_EMAIL}`}
          className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:bg-primary-50 hover:text-primary-600 transition-colors">
          <Mail size={15}/> Nous contacter
        </a>

        {/* Déconnexion */}
        <button onClick={() => { logout(); navigate('/connexion'); }}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 w-full transition-colors">
          <LogOut size={18}/> Déconnexion
        </button>
      </div>
    </div>
  );
}

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuthStore();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-100 fixed top-0 left-0 h-full z-30">
        <Sidebar />
      </aside>
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-40 flex">
          <div className="absolute inset-0 bg-black/30" onClick={() => setSidebarOpen(false)}/>
          <aside className="relative w-72 bg-white h-full z-50 shadow-xl">
            <Sidebar onClose={() => setSidebarOpen(false)}/>
          </aside>
        </div>
      )}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <header className="md:hidden bg-white border-b border-gray-100 px-4 py-3 flex items-center gap-3 sticky top-0 z-20 shadow-sm">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 text-gray-500 hover:text-primary-600 rounded-lg hover:bg-gray-50">
            <Menu size={22}/>
          </button>
          <span className="font-semibold text-gray-900 text-sm truncate">{user?.structure?.nomCommercial}</span>
        </header>
        <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-8">
          <Outlet/>
        </main>

        {/* Footer dans le contenu principal */}
        <footer className="border-t border-gray-100 px-6 py-4 bg-white">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-400">
            <span>© {new Date().getFullYear()} AZAMED — Plateforme gratuite pour les professionnels de santé</span>
            <a href={`mailto:${CONTACT_EMAIL}`}
              className="flex items-center gap-1.5 hover:text-primary-600 transition-colors group">
              <Mail size={12}/>
              <span className="group-hover:underline">{CONTACT_EMAIL}</span>
            </a>
          </div>
        </footer>
      </div>
    </div>
  );
}
