// src/App.jsx — SITE STRUCTURES avec toutes les routes
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from './components/ui/Toaster';
import useAuthStore from './store/authStore';

import AccueilPage          from './pages/AccueilPage';
import LoginPage            from './pages/LoginPage';
import RegisterPage         from './pages/RegisterPage';
import DashboardLayout      from './pages/dashboard/DashboardLayout';
import DashboardHome        from './pages/dashboard/DashboardHome';
import DashboardProfil      from './pages/dashboard/DashboardProfil';
import DashboardPharmacie   from './pages/dashboard/DashboardPharmacie';
import DashboardLaboratoire from './pages/dashboard/DashboardLaboratoire';
import DashboardImagerie    from './pages/dashboard/DashboardImagerie';
import DashboardHopital     from './pages/dashboard/DashboardHopital';
import DashboardPosts       from './pages/dashboard/DashboardPosts';
import DashboardAssurances  from './pages/dashboard/DashboardAssurances';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? children : <Navigate to="/connexion" />;
};

const GuestRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <Navigate to="/dashboard" /> : children;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"            element={<GuestRoute><AccueilPage /></GuestRoute>} />
        <Route path="/connexion"   element={<GuestRoute><LoginPage /></GuestRoute>} />
        <Route path="/inscription" element={<GuestRoute><RegisterPage /></GuestRoute>} />

        <Route path="/dashboard" element={<PrivateRoute><DashboardLayout /></PrivateRoute>}>
          <Route index                   element={<DashboardHome />} />
          <Route path="profil"           element={<DashboardProfil />} />
          <Route path="pharmacie"        element={<DashboardPharmacie />} />
          <Route path="laboratoire"      element={<DashboardLaboratoire />} />
          <Route path="imagerie"         element={<DashboardImagerie />} />
          <Route path="hopital"          element={<DashboardHopital />} />
          <Route path="posts"            element={<DashboardPosts />} />
          <Route path="assurances"       element={<DashboardAssurances />} />
        </Route>

        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}
