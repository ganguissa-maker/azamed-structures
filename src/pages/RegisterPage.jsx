// src/pages/RegisterPage.jsx — Formulaire intelligent par type de structure
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ExternalLink, Info, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import { STRUCTURE_THEMES, TYPES_LISTE, CHAMPS_SPECIFIQUES, HEURES } from '../utils/structureThemes';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

// Champ input générique
function Field({ label, name, required, placeholder, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type} name={name} required={required} value={value}
        onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 focus:ring-1 focus:ring-primary-100 transition-colors"/>
    </div>
  );
}

// Étape 1 — Sélection du type
function StepType({ onSelect }) {
  return (
    <div>
      <div className="text-center mb-2">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Étape 1 / 3</p>
        <h2 className="text-xl font-bold text-gray-900">Quel type d'établissement ?</h2>
        <p className="text-gray-500 text-sm mt-1">Sélectionnez votre type pour voir les champs correspondants</p>
      </div>

      {/* Info médecin */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5"/>
        <p className="text-blue-700 text-xs leading-relaxed">
          <strong>Vous êtes médecin ?</strong> L'inscription des médecins se fait sur le site public.{' '}
          <a href={`${PUBLIC_URL}/inscription`} target="_blank" rel="noreferrer" className="font-bold underline">
            Cliquez ici →
          </a>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {TYPES_LISTE.map((type) => {
          const theme = STRUCTURE_THEMES[type.value];
          return (
            <button key={type.value} type="button" onClick={() => onSelect(type.value)}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:border-current text-left transition-all hover:shadow-md group"
              style={{ '--tw-border-opacity': 1 }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 transition-colors"
                style={{ backgroundColor: theme.couleurClair }}>
                {type.icone}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-gray-900 group-hover:text-current"
                  style={{ color: theme.couleur }}>
                  {type.label}
                </p>
                <p className="text-xs text-gray-400 leading-tight mt-0.5">{type.description}</p>
              </div>
              <ChevronRight size={16} className="text-gray-300 group-hover:text-gray-500 shrink-0"/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Étape 2 — Infos spécifiques + communes
function StepInfos({ typeStructure, form, onChange, onNext, onBack }) {
  const theme   = STRUCTURE_THEMES[typeStructure];
  const champs  = CHAMPS_SPECIFIQUES[typeStructure] || [];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: theme.couleurClair }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: theme.couleur + '20' }}>
          {theme.icone}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Étape 2 / 3 · {theme.label}</p>
          <p className="font-bold text-gray-900">Informations de l'établissement</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* Nom de l'établissement */}
        <Field label="Nom de l'établissement" name="nomLegal" required
          placeholder={`Ex: ${theme.icone} ${theme.label} de Yaoundé Centre`}
          value={form.nomLegal} onChange={onChange('nomLegal')}/>

        {/* Champs spécifiques au type */}
        {champs.length > 0 && (
          <div className="rounded-xl p-4 space-y-3 border" style={{ backgroundColor: theme.couleurClair, borderColor: theme.couleurMed + '40' }}>
            <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.couleur }}>
              Informations spécifiques — {theme.label}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {champs.map((c) => (
                <Field key={c.name} label={c.label} name={c.name}
                  required={c.required} placeholder={c.placeholder}
                  value={form[c.name] || ''} onChange={onChange(c.name)}/>
              ))}
            </div>
          </div>
        )}

        {/* Coordonnées communes */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Coordonnées</p>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Téléphone" name="telephone" required placeholder="+237 6XX XX XX XX"
                value={form.telephone} onChange={onChange('telephone')}/>
              <Field label="WhatsApp" name="whatsapp" placeholder="+237 6XX XX XX XX"
                value={form.whatsapp} onChange={onChange('whatsapp')}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Pays" name="pays" required value={form.pays} onChange={onChange('pays')}/>
              <Field label="Ville" name="ville" required placeholder="Yaoundé" value={form.ville} onChange={onChange('ville')}/>
              <Field label="Quartier" name="quartier" placeholder="Bastos" value={form.quartier} onChange={onChange('quartier')}/>
            </div>
            <Field label="Adresse complète" name="adresse" placeholder="Ex: Rue Kennedy, face à la poste"
              value={form.adresse} onChange={onChange('adresse')}/>
          </div>
        </div>

        {/* Horaires */}
        <div className="border rounded-xl p-4" style={{ borderColor: theme.couleurMed + '40', backgroundColor: theme.couleurClair }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.couleur }}>
            🕐 Horaires d'ouverture
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Ouverture</label>
              <select value={form.heureOuverture} onChange={onChange('heureOuverture')}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Fermeture</label>
              <select value={form.heureFermeture} onChange={onChange('heureFermeture')}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={onChange('description')} rows={2}
            placeholder={`Décrivez brièvement votre ${theme.label.toLowerCase()}...`}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"/>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <ChevronLeft size={15}/> Retour
        </button>
        <button type="button" onClick={onNext}
          disabled={!form.nomLegal || !form.telephone || !form.ville}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: theme.couleur }}>
          Continuer <ChevronRight size={15}/>
        </button>
      </div>
    </div>
  );
}

// Étape 3 — Identifiants + CGU
function StepCompte({ typeStructure, form, onChange, onSubmit, onBack, loading }) {
  const theme = STRUCTURE_THEMES[typeStructure];
  const [acceptCGU, setAcceptCGU] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptCGU) { toast.error("Acceptez les conditions d'utilisation."); return; }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: theme.couleurClair }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: theme.couleur + '20' }}>
          {theme.icone}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Étape 3 / 3</p>
          <p className="font-bold text-gray-900">Identifiants de connexion</p>
        </div>
      </div>

      <div className="space-y-4">
        <Field label="Adresse email" name="email" type="email" required placeholder="votre@email.com"
          value={form.email} onChange={onChange('email')}/>
        <Field label="Mot de passe" name="password" type="password" required placeholder="Minimum 6 caractères"
          value={form.password} onChange={onChange('password')}/>

        {/* Récap */}
        <div className="rounded-xl p-4 space-y-1.5" style={{ backgroundColor: theme.couleurClair }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.couleur }}>Récapitulatif</p>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Check size={12} style={{ color: theme.couleur }}/>
            <span><strong>Type :</strong> {theme.icone} {theme.label}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Check size={12} style={{ color: theme.couleur }}/>
            <span><strong>Nom :</strong> {form.nomLegal}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Check size={12} style={{ color: theme.couleur }}/>
            <span><strong>Ville :</strong> {form.ville}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Check size={12} style={{ color: theme.couleur }}/>
            <span><strong>Horaires :</strong> {form.heureOuverture} – {form.heureFermeture}</span>
          </div>
        </div>

        {/* CGU */}
        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <input type="checkbox" id="cgu" checked={acceptCGU}
            onChange={(e) => setAcceptCGU(e.target.checked)}
            className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer" style={{ accentColor: theme.couleur }}/>
          <label htmlFor="cgu" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
            J'accepte les conditions générales d'utilisation d'AZAMED et je certifie que mon établissement exerce légalement au Cameroun.
          </label>
        </div>
      </div>

      <div className="flex gap-3 mt-6">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <ChevronLeft size={15}/> Retour
        </button>
        <button type="submit" disabled={loading || !acceptCGU || !form.email || !form.password}
          className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold text-white transition-all disabled:opacity-60"
          style={{ backgroundColor: theme.couleur }}>
          {loading
            ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Création...</>
            : <><UserPlus size={16}/> Créer mon compte gratuitement</>}
        </button>
      </div>
    </form>
  );
}

// ─── Composant principal ──────────────────────────────────────
export default function RegisterPage() {
  const [step, setStep]           = useState(1);
  const [typeStructure, setType]  = useState('');
  const [form, setForm]           = useState({
    nomLegal: '', telephone: '', whatsapp: '', adresse: '',
    pays: 'Cameroun', ville: '', quartier: '', description: '',
    heureOuverture: '08:00', heureFermeture: '18:00',
    email: '', password: '',
  });
  const [loading, setLoading]     = useState(false);
  const { login }                 = useAuthStore();
  const navigate                  = useNavigate();

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectType = (type) => {
    setType(type);
    setStep(2);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const payload = { ...form, typeStructure };
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

  const theme = typeStructure ? STRUCTURE_THEMES[typeStructure] : null;

  return (
    <div className={`min-h-screen flex flex-col ${theme ? `bg-gradient-to-br ${theme.gradient}` : 'bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700'}`}>
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AZ</span>
            </div>
            <span className="font-bold text-white">AZAMED Structures</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Indicateur d'étapes */}
            {[1,2,3].map((s) => (
              <div key={s} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? 'bg-white text-primary-700'
                : s === step ? 'bg-white/90 text-primary-700 shadow-lg scale-110'
                : 'bg-white/20 text-white'
              }`}>
                {s < step ? <Check size={12}/> : s}
              </div>
            ))}
          </div>
        </div>
      </header>

      <div className="flex-1 px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            {step === 1 && <StepType onSelect={handleSelectType}/>}
            {step === 2 && (
              <StepInfos
                typeStructure={typeStructure}
                form={form}
                onChange={handleChange}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}
              />
            )}
            {step === 3 && (
              <StepCompte
                typeStructure={typeStructure}
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBack={() => setStep(2)}
                loading={loading}
              />
            )}

            {step === 1 && (
              <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                <p className="text-sm text-gray-500">
                  Déjà inscrit ?{' '}
                  <Link to="/connexion" className="text-primary-600 font-semibold hover:underline">Se connecter</Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
