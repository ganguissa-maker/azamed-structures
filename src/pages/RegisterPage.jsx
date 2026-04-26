// src/pages/RegisterPage.jsx — Formulaire d'inscription complet
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ExternalLink, Info, ChevronRight, ChevronLeft, Check } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import {
  STRUCTURE_THEMES, TYPES_LISTE, CHAMPS_SPECIFIQUES,
  MODULES_PAR_DEFAUT, QUESTIONS_ADDITIONNELLES,
  JOURS_SEMAINE, HEURES,
} from '../utils/structureThemes';

const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';

// ─── Champ input générique ────────────────────────────────────
function Field({ label, name, required, placeholder, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input type={type} name={name} required={required} value={value}
        onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors"/>
    </div>
  );
}

// ─── Section horaires ─────────────────────────────────────────
function SectionHoraires({ form, onChange, theme }) {
  const h24 = form.horaire24h7j === true;

  const toggleJour = (jour) => {
    const current = form.joursOuverture || [];
    const updated  = current.includes(jour)
      ? current.filter((j) => j !== jour)
      : [...current, jour];
    onChange('joursOuverture')({ target: { value: updated } });
  };

  return (
    <div className="rounded-xl p-4 border" style={{ borderColor: theme.couleurMed + '40', backgroundColor: theme.couleurClair }}>
      <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.couleur }}>
        🕐 Horaires d'ouverture
      </p>

      {/* 7j/7 24h/24 */}
      <label className="flex items-center gap-3 cursor-pointer mb-3">
        <input type="checkbox" checked={h24}
          onChange={(e) => onChange('horaire24h7j')({ target: { value: e.target.checked } })}
          className="w-4 h-4 rounded cursor-pointer" style={{ accentColor: theme.couleur }}/>
        <span className="text-sm font-semibold text-gray-700">7j/7 et 24h/24</span>
      </label>

      {!h24 && (
        <div className="space-y-3 border-t border-gray-200 pt-3">
          {/* Jours */}
          <div>
            <p className="text-xs font-medium text-gray-600 mb-2">Jours d'ouverture</p>
            <div className="flex flex-wrap gap-2">
              {JOURS_SEMAINE.map((j) => {
                const selected = (form.joursOuverture || []).includes(j.key);
                return (
                  <button type="button" key={j.key} onClick={() => toggleJour(j.key)}
                    className="px-3 py-1.5 rounded-lg text-xs font-semibold border-2 transition-all"
                    style={selected
                      ? { backgroundColor: theme.couleur, borderColor: theme.couleur, color: '#fff' }
                      : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}>
                    {j.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Plage horaire */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Heure d'ouverture</label>
              <select value={form.heureOuverture || '08:00'} onChange={onChange('heureOuverture')}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Heure de fermeture</label>
              <select value={form.heureFermeture || '18:00'} onChange={onChange('heureFermeture')}
                className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Questions Oui/Non ────────────────────────────────────────
function QuestionsOuiNon({ typeStructure, form, onChange, theme }) {
  const questions = QUESTIONS_ADDITIONNELLES[typeStructure] || [];
  if (questions.length === 0) return null;

  return (
    <div className="rounded-xl p-4 border border-gray-200 bg-gray-50 space-y-3">
      <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Modules optionnels</p>
      {questions.map((q) => {
        const checked = form[q.key] === true;
        return (
          <label key={q.key} className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" checked={checked}
              onChange={(e) => onChange(q.key)({ target: { value: e.target.checked } })}
              className="mt-0.5 w-4 h-4 rounded shrink-0" style={{ accentColor: theme.couleur }}/>
            <span className="text-sm text-gray-700 leading-relaxed">{q.label}</span>
          </label>
        );
      })}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 1 — Choix du type
// ═══════════════════════════════════════════════════════════════
function StepType({ onSelect }) {
  return (
    <div>
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Étape 1 / 3</p>
        <h2 className="text-xl font-bold text-gray-900">Quel type d'établissement ?</h2>
        <p className="text-gray-500 text-sm mt-1">Sélectionnez votre type pour voir les champs correspondants</p>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5"/>
        <p className="text-blue-700 text-xs leading-relaxed">
          <strong>Vous êtes médecin ?</strong> L'inscription des médecins se fait sur le site public.{' '}
          <a href={`${PUBLIC_URL}/inscription`} target="_blank" rel="noreferrer" className="font-bold underline">Cliquez ici →</a>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {TYPES_LISTE.map((type) => {
          const theme = STRUCTURE_THEMES[type.value];
          return (
            <button key={type.value} type="button" onClick={() => onSelect(type.value)}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:shadow-md text-left transition-all group">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: theme.couleurClair }}>
                {type.icone}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm" style={{ color: theme.couleur }}>{type.label}</p>
                <p className="text-xs text-gray-400 leading-tight mt-0.5">{type.description}</p>
              </div>
              <ChevronRight size={15} className="text-gray-300 shrink-0"/>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 2 — Infos établissement
// ═══════════════════════════════════════════════════════════════
function StepInfos({ typeStructure, form, onChange, onNext, onBack }) {
  const theme  = STRUCTURE_THEMES[typeStructure];
  const champs = CHAMPS_SPECIFIQUES[typeStructure] || [];
  const canContinue = form.nomLegal && form.telephone && form.ville;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: theme.couleurClair }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: theme.couleur + '25' }}>
          {theme.icone}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">Étape 2 / 3 · {theme.label}</p>
          <p className="font-bold text-gray-900">Informations de l'établissement</p>
        </div>
      </div>

      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">

        {/* Nom */}
        <Field label="Nom de l'établissement" name="nomLegal" required
          placeholder={`Ex: ${theme.label} de Yaoundé Centre`}
          value={form.nomLegal} onChange={onChange('nomLegal')}/>

        {/* Champs spécifiques */}
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

        {/* Questions Oui/Non */}
        <QuestionsOuiNon typeStructure={typeStructure} form={form} onChange={onChange} theme={theme}/>

        {/* Coordonnées */}
        <div className="border-t border-gray-100 pt-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Coordonnées</p>
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label="Contact de l'accueil" name="telephone" required placeholder="+237 6XX XX XX XX"
                value={form.telephone} onChange={onChange('telephone')}/>
              <Field label="WhatsApp de l'établissement" name="whatsapp" placeholder="+237 6XX XX XX XX"
                value={form.whatsapp} onChange={onChange('whatsapp')}/>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <Field label="Pays" name="pays" required value={form.pays} onChange={onChange('pays')}/>
              <Field label="Ville" name="ville" required placeholder="Yaoundé" value={form.ville} onChange={onChange('ville')}/>
              <Field label="Quartier" name="quartier" placeholder="Bastos" value={form.quartier} onChange={onChange('quartier')}/>
            </div>
            <Field label="Adresse complète" name="adresse"
              placeholder="Ex: Rue Kennedy, face à la poste" value={form.adresse} onChange={onChange('adresse')}/>
          </div>
        </div>

        {/* Horaires */}
        <SectionHoraires form={form} onChange={onChange} theme={theme}/>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={onChange('description')} rows={2}
            placeholder={`Décrivez brièvement votre ${theme.label.toLowerCase()}...`}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"/>
        </div>
      </div>

      <div className="flex gap-3 mt-5 pt-3 border-t border-gray-100">
        <button type="button" onClick={onBack}
          className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
          <ChevronLeft size={15}/> Retour
        </button>
        <button type="button" onClick={onNext} disabled={!canContinue}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold text-white transition-colors disabled:opacity-50"
          style={{ backgroundColor: theme.couleur }}>
          Continuer <ChevronRight size={15}/>
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════
// ÉTAPE 3 — Compte + CGU
// ═══════════════════════════════════════════════════════════════
function StepCompte({ typeStructure, form, onChange, onSubmit, onBack, loading }) {
  const theme = STRUCTURE_THEMES[typeStructure];
  const [acceptCGU, setAcceptCGU] = useState(false);

  // Construire liste des modules actifs
  const modulesDefaut = MODULES_PAR_DEFAUT[typeStructure] || {};
  const questions     = QUESTIONS_ADDITIONNELLES[typeStructure] || [];
  const modulesActifs = [];

  if (modulesDefaut.medicaments) modulesActifs.push('💊 Médicaments');
  if (modulesDefaut.examens)     modulesActifs.push('🔬 Examens');
  if (modulesDefaut.services)    modulesActifs.push('🏥 Services médicaux');
  questions.forEach((q) => {
    if (form[q.key] === true) {
      const labels = { services:'🏥 Services médicaux', medicaments:'💊 Médicaments', examens:'🔬 Examens', assurance:'🛡️ Assurances' };
      const l = labels[q.active];
      if (l && !modulesActifs.includes(l)) modulesActifs.push(l);
    }
  });

  const horairesResume = form.horaire24h7j
    ? '7j/7 et 24h/24'
    : (form.joursOuverture?.length
        ? `${form.joursOuverture.join(', ')} · ${form.heureOuverture || '08:00'} – ${form.heureFermeture || '18:00'}`
        : `${form.heureOuverture || '08:00'} – ${form.heureFermeture || '18:00'}`);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptCGU) { toast.error("Acceptez les conditions d'utilisation."); return; }
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: theme.couleurClair }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl" style={{ backgroundColor: theme.couleur + '25' }}>
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

        {/* Récapitulatif */}
        <div className="rounded-xl p-4 space-y-2" style={{ backgroundColor: theme.couleurClair }}>
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.couleur }}>Récapitulatif</p>
          {[
            { l:'Type',      v:`${theme.icone} ${theme.label}` },
            { l:'Nom',       v:form.nomLegal },
            { l:'Ville',     v:form.ville },
            { l:'Horaires',  v:horairesResume },
          ].map(({ l, v }) => v && (
            <div key={l} className="flex items-center gap-2 text-xs text-gray-600">
              <Check size={11} style={{ color: theme.couleur }}/> <strong>{l} :</strong> {v}
            </div>
          ))}
          {modulesActifs.length > 0 && (
            <div className="pt-1 mt-1 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-1">Modules activés :</p>
              <div className="flex flex-wrap gap-1.5">
                {modulesActifs.map((m) => (
                  <span key={m} className="text-xs px-2 py-0.5 rounded-full text-white font-medium"
                    style={{ backgroundColor: theme.couleur }}>{m}</span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* CGU */}
        <div className="flex items-start gap-3 bg-gray-50 p-3 rounded-xl border border-gray-100">
          <input type="checkbox" id="cgu" checked={acceptCGU}
            onChange={(e) => setAcceptCGU(e.target.checked)}
            className="mt-0.5 w-4 h-4 shrink-0 cursor-pointer" style={{ accentColor: theme.couleur }}/>
          <label htmlFor="cgu" className="text-xs text-gray-600 leading-relaxed cursor-pointer">
            J'accepte les conditions générales d'utilisation d'AZAMED et certifie que mon établissement exerce légalement au Cameroun.
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

// ═══════════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════════
export default function RegisterPage() {
  const [step, setStep]          = useState(1);
  const [typeStructure, setType] = useState('');
  const [form, setForm]          = useState({
    nomLegal:'', telephone:'', whatsapp:'', adresse:'',
    pays:'Cameroun', ville:'', quartier:'', description:'',
    // Horaires
    horaire24h7j: false,
    joursOuverture: ['lundi','mardi','mercredi','jeudi','vendredi'],
    heureOuverture:'08:00', heureFermeture:'18:00',
    // Modules optionnels
    offresServices:false, faitExamens:false, dispenseMeds:false, collaboreAssurance:false,
    // Connexion
    email:'', password:'',
  });
  const [loading, setLoading] = useState(false);
  const { login }             = useAuthStore();
  const navigate              = useNavigate();

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSelectType = (type) => {
    setType(type);
    setStep(2);
  };

  // Calcule les modules actifs pour les sauvegarder
  const computeModules = () => {
    const def = MODULES_PAR_DEFAUT[typeStructure] || {};
    const questions = QUESTIONS_ADDITIONNELLES[typeStructure] || [];
    const modules = { ...def };
    questions.forEach((q) => {
      if (form[q.key] === true) {
        if (q.active === 'services')    modules.services    = true;
        if (q.active === 'medicaments') modules.medicaments = true;
        if (q.active === 'examens')     modules.examens     = true;
        if (q.active === 'assurance')   modules.assurance   = true;
      }
    });
    return modules;
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const modules = computeModules();
      const payload = {
        ...form,
        typeStructure,
        modules, // sauvegardé dans description ou champ JSON selon votre schema
        // Horaires formatés
        horaires: form.horaire24h7j
          ? '7j/7 24h/24'
          : `${(form.joursOuverture || []).join(',')} ${form.heureOuverture}-${form.heureFermeture}`,
      };
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
    <div className={`min-h-screen flex flex-col ${theme ? `bg-gradient-to-br ${theme.gradient}` : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'}`}>

      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AZ</span>
            </div>
            <span className="font-bold text-white">AZAMED Structures</span>
          </Link>

          {/* Indicateur étapes */}
          <div className="flex items-center gap-2">
            {[1,2,3].map((s) => (
              <div key={s} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step  ? 'bg-white text-gray-800'
                : s === step ? 'bg-white/90 text-gray-800 shadow-lg scale-110'
                : 'bg-white/20 text-white'
              }`}>
                {s < step ? <Check size={12}/> : s}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Contenu */}
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            {step === 1 && <StepType onSelect={handleSelectType}/>}
            {step === 2 && (
              <StepInfos
                typeStructure={typeStructure}
                form={form}
                onChange={handleChange}
                onNext={() => setStep(3)}
                onBack={() => setStep(1)}/>
            )}
            {step === 3 && (
              <StepCompte
                typeStructure={typeStructure}
                form={form}
                onChange={handleChange}
                onSubmit={handleSubmit}
                onBack={() => setStep(2)}
                loading={loading}/>
            )}

            {step === 1 && (
              <div className="mt-5 pt-4 border-t border-gray-100 text-center">
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
