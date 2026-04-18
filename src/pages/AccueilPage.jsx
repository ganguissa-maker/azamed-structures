// src/pages/AccueilPage.jsx — ESPACE STRUCTURES
// Contact : contactazamed@gmail.com

import { Link } from 'react-router-dom';
import { Pill, TestTube2, Building2, CheckCircle, Newspaper, UserPlus, LogIn, ExternalLink, Mail } from 'lucide-react';

const PUBLIC_URL    = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';
const CONTACT_EMAIL = 'contactazamed@gmail.com';

const avantages = [
  { icon:<Pill size={20} className="text-green-500"/>,      titre:'Gérez vos médicaments',   desc:'Cochez en un clic quels médicaments sont disponibles dans votre pharmacie et à quel prix.' },
  { icon:<TestTube2 size={20} className="text-blue-500"/>,  titre:'Gérez vos examens',       desc:'Renseignez les examens que vous réalisez, les prix et les délais de résultats.' },
  { icon:<Building2 size={20} className="text-primary-500"/>,titre:'Gérez vos services',     desc:'Indiquez vos spécialités, si consultation sur RDV, et vos tarifs.' },
  { icon:<Newspaper size={20} className="text-purple-500"/>,titre:'Publiez des actualités',  desc:'Informez vos patients : nouvelles ouvertures, promotions, campagnes de dépistage...' },
];

const types = [
  { icon:<Pill size={22}/>,      label:'Pharmacie' },
  { icon:<TestTube2 size={22}/>, label:'Laboratoire' },
  { icon:<Building2 size={22}/>, label:'Hôpital' },
  { icon:<Building2 size={22}/>, label:'Clinique' },
  { icon:<Building2 size={22}/>, label:'Cabinet médical' },
  { icon:<Building2 size={22}/>, label:'Médecin' },
];

export default function AccueilPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700">

      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">AZ</span>
            </div>
            <div>
              <p className="font-bold text-white leading-none">AZAMED</p>
              <p className="text-primary-200 text-xs leading-none">Espace Établissements</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <a href={PUBLIC_URL} target="_blank" rel="noreferrer"
              className="hidden sm:flex items-center gap-1.5 text-xs text-primary-200 hover:text-white border border-primary-600 hover:border-primary-300 px-3 py-1.5 rounded-lg transition-colors">
              <ExternalLink size={12}/> Site public
            </a>
            <Link to="/connexion" className="text-sm text-primary-100 hover:text-white border border-primary-500 hover:border-primary-300 px-4 py-1.5 rounded-lg transition-colors">
              Connexion
            </Link>
            <Link to="/inscription" className="text-sm bg-white text-primary-700 font-semibold px-4 py-1.5 rounded-lg hover:bg-primary-50 transition-colors">
              S'inscrire
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/10 text-primary-100 text-sm px-4 py-1.5 rounded-full mb-4">
            ✓ Gratuit — Aucun frais, aucun abonnement
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 leading-tight">
            Gérez votre établissement<br/>sur AZAMED
          </h1>
          <p className="text-primary-100 text-base sm:text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Renseignez vos médicaments disponibles, vos examens, vos services et vos tarifs. Soyez trouvés par des milliers de patients au Cameroun. <strong>Totalement gratuit.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inscription"
              className="flex items-center justify-center gap-2 bg-white text-primary-700 font-bold px-8 py-4 rounded-2xl hover:bg-primary-50 transition-colors shadow-lg text-base">
              <UserPlus size={20}/> Inscrire mon établissement
            </Link>
            <Link to="/connexion"
              className="flex items-center justify-center gap-2 bg-white/10 text-white font-semibold px-8 py-4 rounded-2xl hover:bg-white/20 transition-colors border border-white/20 text-base">
              <LogIn size={20}/> J'ai déjà un compte
            </Link>
          </div>
          <p className="text-primary-200 text-sm mt-4">✓ Inscription gratuite · ✓ Pas de carte bancaire · ✓ Sans engagement</p>
        </div>
      </section>

      {/* Types */}
      <section className="bg-white/5 border-t border-white/10 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <p className="text-center text-primary-200 text-xs uppercase tracking-wider font-semibold mb-5">
            Ouvert à tous les professionnels de santé
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {types.map((t) => (
              <div key={t.label} className="bg-white/10 rounded-xl p-3 text-center">
                <div className="flex justify-center mb-1.5 text-white opacity-80">{t.icon}</div>
                <p className="text-white text-xs font-medium leading-tight">{t.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Avantages */}
      <section className="bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-gray-900 text-center mb-8">Ce que vous pouvez faire sur AZAMED</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {avantages.map((a) => (
              <div key={a.titre} className="flex items-start gap-4 p-5 rounded-2xl border border-gray-100 hover:border-primary-100 hover:bg-primary-50/30 transition-colors">
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center shrink-0">{a.icon}</div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1 text-sm">{a.titre}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{a.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/inscription"
              className="inline-flex items-center gap-2 bg-primary-600 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-primary-700 transition-colors">
              <UserPlus size={18}/> Créer mon compte gratuitement
            </Link>
          </div>
        </div>
      </section>

      {/* Footer avec contact */}
      <footer className="bg-gray-900 border-t border-gray-800 px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
            <div>
              <p className="text-sm font-semibold text-white mb-2">AZAMED — Espace Établissements</p>
              <p className="text-xs text-gray-400 leading-relaxed">
                Plateforme gratuite de gestion de présence en ligne pour les établissements et professionnels de santé du Cameroun.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-2">Contact</p>
              <a href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-2 text-sm text-primary-300 hover:text-primary-200 transition-colors group w-fit">
                <Mail size={14} className="shrink-0"/>
                <span className="group-hover:underline">{CONTACT_EMAIL}</span>
              </a>
              <p className="text-xs text-gray-500 mt-2">
                Pour toute question, assistance technique ou signalement d'un problème.
              </p>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
            <span>© {new Date().getFullYear()} AZAMED — Espace établissements de santé</span>
            <a href={PUBLIC_URL} target="_blank" rel="noreferrer" className="hover:text-gray-400 transition-colors">
              Voir le site public →
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
