// src/pages/LoginPage.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, Eye, EyeOff, ExternalLink } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

export default function LoginPage() {
  const [form, setForm]       = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login }             = useAuthStore();
  const navigate              = useNavigate();

  const handleChange = (field) => (e) => setForm((p) => ({ ...p, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success('Connexion réussie !');
      navigate(data.user.role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Email ou mot de passe incorrect');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AZ</span>
            </div>
            <span className="font-bold text-white">AZAMED Structures</span>
          </Link>
          <a href={PUBLIC_URL} target="_blank" rel="noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary-200 hover:text-white transition-colors">
            <ExternalLink size={12} /> Site public
          </a>
        </div>
      </header>

      {/* Form */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-white mb-2">Connexion</h1>
            <p className="text-primary-200 text-sm">Accédez à votre espace établissement</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Adresse email</label>
                <input type="email" required value={form.email} onChange={handleChange('email')}
                  placeholder="votre@email.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input type={showPass ? 'text' : 'password'} required value={form.password} onChange={handleChange('password')}
                    placeholder="••••••••"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 pr-11" />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <button type="submit" disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-semibold py-3.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60 text-sm">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Connexion...</>
                  : <><LogIn size={18} /> Se connecter</>}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-gray-100 text-center space-y-2">
              <p className="text-sm text-gray-500">
                Pas encore inscrit ?{' '}
                <Link to="/inscription" className="text-primary-600 font-semibold hover:underline">
                  Inscrire mon établissement
                </Link>
              </p>
              <Link to="/" className="block text-xs text-gray-400 hover:text-gray-600 transition-colors">
                ← Retour à l'accueil
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
