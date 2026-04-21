// src/pages/RegisterPage.jsx — SITE STRUCTURES
// ✅ Uniquement établissements de santé (pas de médecin ici — inscription médecin sur site public)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ExternalLink, Info } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import api from '../utils/api';
import useAuthStore from '../store/authStore';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

const TYPES = [
  { value:'PHARMACIE',          label:'Pharmacie' },
  { value:'LABORATOIRE',        label:"Laboratoire d'analyses médicales" },
  { value:'HOPITAL_PUBLIC',     label:'Hôpital Public' },
  { value:'HOPITAL_PRIVE',      label:'Hôpital Privé' },
  { value:'CLINIQUE',           label:'Clinique' },
  { value:'CABINET_MEDICAL',    label:'Cabinet Médical' },
  { value:'CABINET_SPECIALISE', label:'Cabinet Spécialisé' },
  { value:'CENTRE_SANTE',       label:'Centre de Santé' },
];

// EN DEHORS pour éviter perte de focus
function Field({ label, name, type, required, placeholder, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type || 'text'} name={name} required={required}
        value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100"/>
    </div>
  );
}

export default function RegisterPage() {
  const [form, setForm] = useState({
    email: '', password: '', nomCommercial: '', nomLegal: '',
    typeStructure: '', telephone: '', whatsapp: '',
    adresse: '', pays: 'Cameroun', ville: '', quartier: '', description: '',
  });
  const [acceptCGU, setAcceptCGU] = useState(false);
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
      toast.error("Vous devez accepter les conditions d'utilisation.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
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
            <h1 className="text-2xl font-bold text-white mb-2">Inscrire mon établissement</h1>
            <p className="text-primary-200 text-sm">Compte gratuit et immédiat</p>
          </div>

          {/* Info médecin → redirection site public */}
          <div className="bg-blue-500/20 border border-blue-300/30 rounded-xl p-4 mb-6 flex items-start gap-3">
            <Info size={18} className="text-blue-200 shrink-0 mt-0.5"/>
            <div>
              <p className="text-blue-100 text-sm font-medium">Vous êtes médecin ?</p>
              <p className="text-blue-200 text-xs mt-1">
                L'inscription des médecins se fait sur le site public AZAMED.{' '}
                <a href={`${PUBLIC_URL}/inscription`} target="_blank" rel="noreferrer"
                  className="text-white font-semibold underline hover:no-underline">
                  Cliquez ici pour vous inscrire →
                </a>
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-2xl p-8">
            <form onSubmit={handleSubmit} className="space-y-4">

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Nom commercial" name="nomCommercial" required
                  placeholder="Ex: Pharmacie Centrale" value={form.nomCommercial} onChange={handleChange('nomCommercial')}/>
                <Field label="Nom légal" name="nomLegal"
                  placeholder="Ex: SARL Pharmacie Centrale" value={form.nomLegal} onChange={handleChange('nomLegal')}/>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'établissement <span className="text-red-400">*</span>
                </label>
                <select required value={form.typeStructure} onChange={handleChange('typeStructure')}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400">
                  <option value="">Sélectionner...</option>
                  {TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Téléphone" name="telephone" required placeholder="+237 6XX XX XX XX"
                  value={form.telephone} onChange={handleChange('telephone')}/>
                <Field label="WhatsApp" name="whatsapp" placeholder="+237 6XX XX XX XX"
                  value={form.whatsapp} onChange={handleChange('whatsapp')}/>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Field label="Pays" name="pays" required value={form.pays} onChange={handleChange('pays')}/>
                <Field label="Ville" name="ville" required placeholder="Ex: Yaoundé"
                  value={form.ville} onChange={handleChange('ville')}/>
                <Field label="Quartier" name="quartier" placeholder="Ex: Bastos"
                  value={form.quartier} onChange={handleChange('quartier')}/>
              </div>

              <Field label="Adresse complète" name="adresse"
                placeholder="Ex: Rue Kennedy, face à la poste" value={form.adresse} onChange={handleChange('adresse')}/>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.description} onChange={handleChange('description')} rows={2}
                  placeholder="Décrivez brièvement votre établissement..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 resize-none"/>
              </div>

              <div className="border-t border-gray-100 pt-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">Identifiants de connexion</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field label="Email" name="email" type="email" required placeholder="votre@email.com"
                    value={form.email} onChange={handleChange('email')}/>
                  <Field label="Mot de passe" name="password" type="password" required placeholder="Min. 8 caractères"
                    value={form.password} onChange={handleChange('password')}/>
                </div>
              </div>

              {/* CGU */}
              <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
                <input type="checkbox" id="cgu" checked={acceptCGU}
                  onChange={(e) => setAcceptCGU(e.target.checked)}
                  className="mt-0.5 w-4 h-4 accent-primary-600 shrink-0 cursor-pointer"/>
                <label htmlFor="cgu" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
                  J'accepte les conditions générales d'utilisation d'AZAMED et je certifie que les informations fournies sont exactes et que mon établissement exerce légalement au Cameroun.
                </label>
              </div>

              <button type="submit" disabled={loading || !acceptCGU}
                className="w-full flex items-center justify-center gap-2 bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-60">
                {loading
                  ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Création en cours...</>
                  : <><UserPlus size={18}/> Créer mon compte gratuitement</>}
              </button>
            </form>

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