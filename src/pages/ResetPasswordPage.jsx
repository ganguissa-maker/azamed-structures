// src/pages/ResetPasswordPage.jsx — Réinitialisation directe structures (sans code email)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Lock } from 'lucide-react';
import api from '../utils/api';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [email, setEmail]     = useState('');
  const [newPwd, setNewPwd]   = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleReset = async (e) => {
    e.preventDefault();
    if (!email.includes('@')) { setError('Email invalide.'); return; }
    if (newPwd.length < 8)    { setError('Mot de passe : minimum 8 caractères.'); return; }
    if (newPwd !== confirm)   { setError('Les mots de passe ne correspondent pas.'); return; }

    setLoading(true); setError('');
    try {
      await api.post('/auth/reset-password-direct', {
        email:       email.trim().toLowerCase(),
        newPassword: newPwd,
      });
      navigate('/connexion', { state: { message: '✅ Mot de passe modifié. Vous pouvez vous connecter.' } });
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la réinitialisation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary-100 flex items-center justify-center mx-auto mb-4">
            <Lock size={28} className="text-primary-600"/>
          </div>
          <h1 className="text-xl font-bold text-gray-900">Mot de passe oublié</h1>
          <p className="text-sm text-gray-500 mt-1">Entrez votre email et choisissez un nouveau mot de passe</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl mb-4">{error}</div>
          )}

          <form onSubmit={handleReset} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Adresse email</label>
              <input type="email" value={email} onChange={(e)=>{setEmail(e.target.value);setError('');}}
                placeholder="votre@email.com"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">
                Nouveau mot de passe <span className="text-gray-400 font-normal">(min. 8 caractères)</span>
              </label>
              <input type="password" value={newPwd} onChange={(e)=>{setNewPwd(e.target.value);setError('');}}
                placeholder="••••••••"
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400"/>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Confirmer</label>
              <input type="password" value={confirm} onChange={(e)=>{setConfirm(e.target.value);setError('');}}
                placeholder="••••••••"
                className={`w-full px-3 py-2.5 border rounded-xl text-sm focus:outline-none ${
                  confirm && newPwd!==confirm ? 'border-red-400' : 'border-gray-200 focus:border-primary-400'
                }`}/>
              {confirm && newPwd!==confirm && (
                <p className="text-xs text-red-600 mt-1 font-medium">Les mots de passe ne correspondent pas</p>
              )}
              {confirm && newPwd===confirm && newPwd.length>=8 && (
                <p className="text-xs text-green-600 mt-1 font-medium">✓ Mots de passe identiques</p>
              )}
            </div>

            <button type="submit" disabled={loading}
              className="w-full bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-semibold py-3 rounded-xl transition-colors">
              {loading ? 'Réinitialisation...' : '✅ Réinitialiser le mot de passe'}
            </button>
          </form>
        </div>

        <div className="text-center mt-6 space-y-2">
          <Link to="/connexion" className="block text-sm text-primary-600 hover:underline">← Retour à la connexion</Link>
          <p className="text-xs text-gray-400">contactazamed98@gmail.com</p>
        </div>
      </div>
    </div>
  );
}
