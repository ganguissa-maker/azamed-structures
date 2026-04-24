// src/pages/AccueilPage.jsx — Page d'accueil structures avec tous les types
import { Link } from 'react-router-dom';
import { CheckCircle, ExternalLink, UserPlus, LogIn, Mail } from 'lucide-react';
import { TYPES_LISTE, STRUCTURE_THEMES } from '../utils/structureThemes';

const PUBLIC_URL    = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';
const CONTACT_EMAIL = 'contactazamed@gmail.com';

const avantages = [
  { emoji:'👁️',  titre:'Visible par vos patients',      desc:'Une fois vérifié, votre établissement apparaît sur AZAMED et l\'application mobile.' },
  { emoji:'💊',  titre:'Médicaments & examens en ligne', desc:'Renseignez vos disponibilités et prix en quelques clics.' },
  { emoji:'📢',  titre:'Publiez vos actualités',         desc:'Informez vos patients de vos promotions, horaires et nouvelles.' },
  { emoji:'✅',  titre:'Vérification gratuite',          desc:'L\'équipe AZAMED vérifie et valide votre établissement sans frais.' },
];

export default function AccueilPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AZ</span>
            </div>
            <div>
              <p className="font-bold text-white leading-none">AZAMED</p>
              <p className="text-gray-400 text-xs leading-none">Espace Établissements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={PUBLIC_URL} target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 hover:text-white border border-gray-700 hover:border-gray-500 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink size={12}/> Site public
            </a>
            <Link to="/connexion"
              className="text-sm text-gray-300 hover:text-white border border-gray-600 hover:border-gray-400 px-4 py-1.5 rounded-lg transition-colors">
              Connexion
            </Link>
            <Link to="/inscription"
              className="text-sm bg-white text-gray-900 font-semibold px-4 py-1.5 rounded-lg hover:bg-gray-100 transition-colors">
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-gray-300 text-sm px-4 py-1.5 rounded-full mb-4">
            <CheckCircle size={14} className="text-green-400"/> Gratuit — Sans frais, sans abonnement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Gérez votre établissement<br/>de santé sur AZAMED
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-8 leading-relaxed max-w-xl mx-auto">
            Pharmacies, laboratoires, hôpitaux, cliniques, centres d'imagerie — tous les établissements de santé du Cameroun sur une seule plateforme.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inscription"
              className="flex items-center justify-center gap-2 bg-white text-gray-900 font-bold px-8 py-4 rounded-2xl hover:bg-gray-100 transition-colors shadow-lg text-base">
              <UserPlus size={20}/> Inscrire mon établissement
            </Link>
            <Link to="/connexion"
              className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors border border-white/20 text-base">
              <LogIn size={20}/> J'ai déjà un compte
            </Link>
          </div>
          <p className="text-gray-500 text-sm mt-4">✓ Inscription gratuite · ✓ Pas de carte bancaire · ✓ Sans engagement</p>
        </div>
      </section>

      {/* Types de structures */}
      <section className="bg-white/5 border-t border-white/10 py-10 px-4">
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-gray-400 text-xs uppercase tracking-wider font-semibold mb-6">
            Pour tous les établissements de santé
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {TYPES_LISTE.map((t) => {
              const theme = STRUCTURE_THEMES[t.value];
              return (
                <div key={t.value} className="rounded-xl p-3 text-center border border-white/10 hover:border-white/30 transition-colors"
                  style={{ backgroundColor: theme.couleur + '20' }}>
                  <div className="text-2xl mb-1.5">{t.icone}</div>
                  <p className="text-white text-xs font-semibold leading-tight">{t.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Pourquoi rejoindre AZAMED ?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {avantages.map((a) => (
              <div key={a.titre} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center text-xl shrink-0">{a.emoji}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{a.titre}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/inscription"
              className="inline-flex items-center gap-2 bg-gray-900 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-gray-800 transition-colors">
              <UserPlus size={18}/> Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-6">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>© {new Date().getFullYear()} AZAMED — Espace établissements de santé</span>
          <a href={`mailto:${CONTACT_EMAIL}`}
            className="flex items-center gap-1.5 hover:text-gray-400 transition-colors">
            <Mail size={12}/> {CONTACT_EMAIL}
          </a>
          <a href={PUBLIC_URL} target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">
            Voir le site public →
          </a>
        </div>
      </footer>
    </div>
  );
}
