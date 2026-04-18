// src/pages/admin/AdminLayout.jsx
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Building2, Newspaper, Pill, LogOut, ExternalLink } from 'lucide-react';
import useAuthStore from '../../store/authStore';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

const navItems = [
  { to: '/admin',             label: 'Dashboard',    icon: <LayoutDashboard size={18} />, end: true },
  { to: '/admin/structures',  label: 'Structures',   icon: <Building2 size={18} /> },
  { to: '/admin/posts',       label: 'Publications', icon: <Newspaper size={18} /> },
  { to: '/admin/medicaments', label: 'Médicaments',  icon: <Pill size={18} /> },
];

export default function AdminLayout() {
  const { logout } = useAuthStore();
  const navigate   = useNavigate();

  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-60 bg-gray-900 text-white flex flex-col fixed top-0 left-0 h-full">
        <div className="p-5 border-b border-gray-700">
          <p className="font-bold text-white text-sm">AZAMED Admin</p>
          <p className="text-xs text-gray-400 mt-0.5">Back-office</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`
              }>
              {item.icon} {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 border-t border-gray-700 space-y-1">
          <a href={PUBLIC_URL} target="_blank" rel="noreferrer"
            className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-400 hover:text-gray-200">
            <ExternalLink size={16} /> Site public
          </a>
          <button onClick={() => { logout(); navigate('/connexion'); }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-gray-400 hover:text-red-400 w-full">
            <LogOut size={18} /> Déconnexion
          </button>
        </div>
      </aside>
      <main className="flex-1 ml-60 p-8">
        <Outlet />
      </main>
    </div>
  );
}
