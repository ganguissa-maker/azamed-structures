// src/pages/RegisterPage.jsx — Avec médecins + CGU + sans abonnement
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

// Types d'établissements de santé
const TYPES_STRUCTURES = [
  { value:'PHARMACIE',          label:'Pharmacie',                    groupe:'Établissements' },
  { value:'LABORATOIRE',        label:"Laboratoire d'analyses",       groupe:'Établissements' },
  { value:'HOPITAL_PUBLIC',     label:'Hôpital Public',               groupe:'Établissements' },
  { value:'HOPITAL_PRIVE',      label:'Hôpital Privé',                groupe:'Établissements' },
  { value:'CLINIQUE',           label:'Clinique',                     groupe:'Établissements' },
  { value:'CABINET_MEDICAL',    label:'Cabinet Médical',              groupe:'Établissements' },
  { value:'CABINET_SPECIALISE', label:'Cabinet Spécialisé',           groupe:'Établissements' },
  { value:'CENTRE_SANTE',       label:'Centre de Santé',              groupe:'Établissements' },
];

// Spécialités médicales pour les médecins
const SPECIALITES_MEDECIN = [
  'Médecine Générale','Cardiologie','Pédiatrie','Gynécologie-Obstétrique',
  'Chirurgie Générale','Neurologie','Dermatologie','Ophtalmologie',
  'ORL','Orthopédie','Gastro-entérologie','Pneumologie',
  'Endocrinologie','Urologie','Psychiatrie','Radiologie',
  'Anesthésiologie','Oncologie','Infectiologie','Médecine Interne',
  'Néphrologie','Rhumatologie','Hématologie','Médecine du Sport','Autre',
];

// Composant Field défini EN DEHORS — évite la perte de focus
function Field({ label, name, type, required, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type || 'text'} name={name} required={required} value={value}
        onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100" />
    </div>
  );
}

// Modale CGU
function CGUModal({ onAccept, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Conditions Générales d'Utilisation — AZAMED</h2>
          <p className="text-xs text-gray-500 mt-0.5">Version 1.0 — Avril 2025</p>
        </div>
        <div className="flex-1 overflow-y-auto p-5 text-sm text-gray-700 space-y-4">
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">1. Objet</h3>
            <p>AZAMED est une plateforme d'annuaire santé camerounaise permettant aux établissements et professionnels de santé de rendre visible leurs services, médicaments disponibles et informations pratiques auprès du grand public. L'accès à la plateforme est entièrement gratuit.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">2. Inscription et compte</h3>
            <p>Seuls les professionnels de santé (médecins, pharmaciens, biologistes, etc.) et les établissements de santé légalement reconnus au Cameroun peuvent créer un compte. Toute inscription frauduleuse entraînera la suppression immédiate du compte.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">3. Exactitude des informations</h3>
            <p>L'utilisateur s'engage à fournir des informations exactes, complètes et à jour. Les prix, disponibilités et services affichés doivent refléter la réalité. Toute information trompeuse peut entraîner la suspension du compte.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">4. Utilisation des données</h3>
            <p>Les informations professionnelles saisies (nom, adresse, téléphone, services) sont publiques et accessibles à tous les visiteurs du site. AZAMED ne vend pas et ne partage pas vos données personnelles à des tiers à des fins commerciales.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">5. Publications</h3>
            <p>Les publications (actualités, promotions, annonces) doivent être en rapport avec l'activité de santé de l'établissement. Toute publication publicitaire agressive, mensongère ou contraire à l'éthique médicale est interdite et sera supprimée.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">6. Vérification des comptes</h3>
            <p>AZAMED se réserve le droit de vérifier l'existence et la légalité de tout établissement ou professionnel inscrit. Un compte non vérifié peut avoir des fonctionnalités limitées. La vérification est gratuite.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">7. Responsabilité</h3>
            <p>AZAMED est un annuaire d'information et ne saurait être tenu responsable des actes médicaux, des diagnostics ou des traitements prescrits par les professionnels référencés. Le patient reste seul juge du choix de son professionnel de santé.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">8. Suspension et suppression</h3>
            <p>AZAMED se réserve le droit de suspendre ou supprimer tout compte ne respectant pas les présentes conditions, sans préavis et sans obligation d'indemnisation.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">9. Modification des CGU</h3>
            <p>AZAMED peut modifier les présentes CGU à tout moment. Les utilisateurs seront informés par email des modifications importantes.</p>
          </section>
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">10. Droit applicable</h3>
            <p>Les présentes CGU sont soumises au droit camerounais. Tout litige sera porté devant les juridictions compétentes du Cameroun.</p>
          </section>
        </div>
        <div className="p-5 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 font-medium">
            Fermer
          </button>
          <button onClick={onAccept} className="flex-1 px-4 py-2.5 bg-primary-600 text-white rounded-xl text-sm font-semibold hover:bg-primary-700 transition-colors">
            J'accepte les conditions
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  const [mode, setMode]       = useState(''); // 'structure' | 'medecin'
  const [form, setForm]       = useState({
    // Commun
    email: '', password: '', telephone: '', whatsapp: '',
    pays: 'Cameroun', ville: '', quartier: '', adresse: '',
    // Structure
    nomCommercial: '', nomLegal: '', typeStructure: '', description: '',
    // Médecin
    prenom: '', nom: '', specialite: '', autreSpecialite: '',
    numeroOrdre: '', diplome: '', lieuExercice: '',
  });
  const [acceptCGU, setAcceptCGU] = useState(false);
  const [showCGU, setShowCGU]     = useState(false);
  const [loading, setLoading]     = useState(false);
  const { login }                 = useAuthStore();
  const navigate                  = useNavigate();

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!acceptCGU) {
      toast.error('Vous devez accepter les conditions d\'utilisation pour continuer.');
      return;
    }
    if (!mode) {
      toast.error('Veuillez sélectionner votre type de compte.');
      return;
    }
    setLoading(true);
    try {
      let payload;
      if (mode === 'medecin') {
        payload = {
          ...form,
          typeStructure: 'CABINET_MEDICAL',
          nomCommercial: `Dr. ${form.prenom} ${form.nom}`,
          nomLegal: `${form.prenom} ${form.nom}`,
          description: `${form.specialite === 'Autre' ? form.autreSpecialite : form.specialite}${form.numeroOrdre ? ` — N° Ordre: ${form.numeroOrdre}` : ''}`,
          estMedecin: true,
          specialite: form.specialite === 'Autre' ? form.autreSpecialite : form.specialite,
        };
      } else {
        payload = form;
      }
      const { data } = await api.post('/auth/register', payload);
      login(data.user, data.token);
      toast.success('Compte créé ! Bienvenue sur AZAMED 🎉');
      navigate('/dashboard');
    } catch (err) {
      toast.error(
        err.response?.data?.errors?.[0]?.msg ||
        err.response?.data?.error ||
        "Erreur lors de l'inscription"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 flex flex-col">
      {showCGU && (
        <CGUModal
          onAccept={() => { setAcceptCGU(true); setShowCGU(false); toast.success('Conditions acceptées ✓'); }}
          onClose={() => setShowCGU(false)}
        />
      )}

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
            <ExternalLink size={12}/> Site public
          </a>
        </div>
      </header>

      <div className="flex-1 px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold text-white mb-2">Créer un compte</h1>
            <p className="text-primary-200 text-sm">Inscription gratuite — accès complet immédiat</p>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Choix du type de compte */}
            <div className="mb-6">
              <p className="text-sm font-semibold text-gray-700 mb-3">Je suis :</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => setMode('structure')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'structure' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="font-semibold text-sm text-gray-900">🏥 Un établissement</p>
                  <p className="text-xs text-gray-500 mt-0.5">Pharmacie, laboratoire, hôpital, clinique...</p>
                </button>
                <button type="button" onClick={() => setMode('medecin')}
                  className={`p-4 rounded-xl border-2 text-left transition-all ${mode === 'medecin' ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <p className="font-semibold text-sm text-gray-900">👨‍⚕️ Un médecin</p>
                  <p className="text-xs text-gray-500 mt-0.5">Médecin généraliste ou spécialiste</p>
                </button>
              </div>
            </div>

            {mode && (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Champs MÉDECIN */}
                {mode === 'medecin' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Prénom" name="prenom" required placeholder="Jean"
                        value={form.prenom} onChange={handleChange('prenom')} />
                      <Field label="Nom" name="nom" required placeholder="Dupont"
                        value={form.nom} onChange={handleChange('nom')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Spécialité <span className="text-red-400">*</span>
                      </label>
                      <select required value={form.specialite} onChange={handleChange('specialite')}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
                        <option value="">Choisir une spécialité...</option>
                        {SPECIALITES_MEDECIN.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    {form.specialite === 'Autre' && (
                      <Field label="Préciser la spécialité" name="autreSpecialite" required
                        placeholder="Ex: Médecine du travail" value={form.autreSpecialite} onChange={handleChange('autreSpecialite')} />
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="N° Ordre des Médecins" name="numeroOrdre" placeholder="Ex: CM-2024-0001"
                        value={form.numeroOrdre} onChange={handleChange('numeroOrdre')} />
                      <Field label="Lieu d'exercice principal" name="lieuExercice" placeholder="Ex: CHU Yaoundé"
                        value={form.lieuExercice} onChange={handleChange('lieuExercice')} />
                    </div>
                  </div>
                )}

                {/* Champs ÉTABLISSEMENT */}
                {mode === 'structure' && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Nom commercial" name="nomCommercial" required
                        placeholder="Ex: Pharmacie Centrale" value={form.nomCommercial} onChange={handleChange('nomCommercial')} />
                      <Field label="Nom légal" name="nomLegal"
                        placeholder="Ex: SARL Pharmacie Centrale" value={form.nomLegal} onChange={handleChange('nomLegal')} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type d'établissement <span className="text-red-400">*</span>
                      </label>
                      <select required value={form.typeStructure} onChange={handleChange('typeStructure')}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
                        <option value="">Sélectionner...</option>
                        {TYPES_STRUCTURES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                      <textarea value={form.description} onChange={handleChange('description')} rows={2}
                        placeholder="Décrivez brièvement votre établissement..."
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 resize-none" />
                    </div>
                  </div>
                )}

                {/* Champs communs */}
                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Coordonnées</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Téléphone" name="telephone" required placeholder="+237 6XX XX XX XX"
                      value={form.telephone} onChange={handleChange('telephone')} />
                    <Field label="WhatsApp" name="whatsapp" placeholder="+237 6XX XX XX XX"
                      value={form.whatsapp} onChange={handleChange('whatsapp')} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Field label="Pays" name="pays" required value={form.pays} onChange={handleChange('pays')} />
                    <Field label="Ville" name="ville" required placeholder="Ex: Yaoundé"
                      value={form.ville} onChange={handleChange('ville')} />
                    <Field label="Quartier" name="quartier" placeholder="Ex: Bastos"
                      value={form.quartier} onChange={handleChange('quartier')} />
                  </div>
                  <Field label="Adresse complète" name="adresse"
                    placeholder="Ex: Rue Kennedy, face à la poste" value={form.adresse} onChange={handleChange('adresse')} />
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Connexion</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label="Adresse email" name="email" type="email" required placeholder="votre@email.com"
                      value={form.email} onChange={handleChange('email')} />
                    <Field label="Mot de passe" name="password" type="password" required placeholder="Min. 8 caractères"
                      value={form.password} onChange={handleChange('password')} />
                  </div>
                </div>

                {/* CGU */}
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <div className="flex items-start gap-3">
                    <input type="checkbox" id="cgu" checked={acceptCGU}
                      onChange={(e) => setAcceptCGU(e.target.checked)}
                      className="mt-0.5 w-4 h-4 accent-primary-600 cursor-pointer shrink-0" />
                    <label htmlFor="cgu" className="text-sm text-gray-700 cursor-pointer leading-relaxed">
                      J'ai lu et j'accepte les{' '}
                      <button type="button" onClick={() => setShowCGU(true)}
                        className="text-primary-600 font-semibold hover:underline">
                        Conditions Générales d'Utilisation
                      </button>{' '}
                      d'AZAMED. Je certifie que les informations fournies sont exactes et que j'exerce légalement ma profession au Cameroun.
                    </label>
                  </div>
                  <button type="button" onClick={() => setShowCGU(true)}
                    className="mt-2 ml-7 text-xs text-primary-600 hover:underline flex items-center gap-1">
                    Lire les conditions complètes →
                  </button>
                </div>

                <button type="submit" disabled={loading || !acceptCGU}
                  className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
                  {loading
                    ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Création...</>
                    : <><UserPlus size={18}/> Créer mon compte gratuitement</>}
                </button>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-gray-100 text-center space-y-2">
              <p className="text-sm text-gray-500">
                Déjà inscrit ?{' '}
                <Link to="/connexion" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
              </p>
              <Link to="/" className="block text-xs text-gray-400 hover:text-gray-600">← Retour à l'accueil</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
