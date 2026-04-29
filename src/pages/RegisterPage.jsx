// src/pages/RegisterPage.jsx — Horaires par jour avec plages individuelles
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { UserPlus, ExternalLink, Info, ChevronRight, ChevronLeft, Check, Plus, X } from 'lucide-react';
import { toast } from '../components/ui/Toaster';
import api from '../utils/api';
import useAuthStore from '../store/authStore';
import {
  STRUCTURE_THEMES, TYPES_LISTE, CHAMPS_SPECIFIQUES,
  MODULES_PAR_DEFAUT, QUESTIONS_ADDITIONNELLES,
  JOURS_SEMAINE, HEURES,
} from '../utils/structureThemes';
 
const PUBLIC_URL = import.meta.env.VITE_PUBLIC_URL || 'http://localhost:5173';
 
// ─── Champ texte ──────────────────────────────────────────────
function Field({ label, name, required, placeholder, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type={type} name={name} required={required}
        value={value} onChange={onChange} placeholder={placeholder}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm
                   focus:outline-none focus:border-primary-400 transition-colors"
      />
    </div>
  );
}
 
// ─── Section Horaires par jour ────────────────────────────────
function SectionHoraires({ form, onChange, theme }) {
  const h24 = form.horaire24h7j === true;
 
  // form.horairesParJour = { lundi: { ouvert: true, debut: '08:00', fin: '18:00' }, ... }
  const horairesParJour = form.horairesParJour || {};
 
  const toggleJour = (jour) => {
    const current = horairesParJour[jour];
    onChange('horairesParJour')({
      target: {
        value: {
          ...horairesParJour,
          [jour]: current
            ? { ...current, ouvert: !current.ouvert }
            : { ouvert: true, debut: '08:00', fin: '18:00' },
        },
      },
    });
  };
 
  const updateHeure = (jour, champ, valeur) => {
    onChange('horairesParJour')({
      target: {
        value: {
          ...horairesParJour,
          [jour]: {
            ...(horairesParJour[jour] || { ouvert: true, debut: '08:00', fin: '18:00' }),
            [champ]: valeur,
          },
        },
      },
    });
  };
 
  return (
    <div
      className="rounded-xl border overflow-hidden"
      style={{ borderColor: theme.couleurMed + '40' }}
    >
      {/* Header */}
      <div className="px-4 py-3" style={{ backgroundColor: theme.couleurClair }}>
        <p className="text-xs font-bold uppercase tracking-wider" style={{ color: theme.couleur }}>
          🕐 Horaires d'ouverture
        </p>
      </div>
 
      <div className="p-4 bg-white space-y-3">
        {/* 7j/7 24h/24 */}
        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
          <input
            type="checkbox" checked={h24}
            onChange={(e) => onChange('horaire24h7j')({ target: { value: e.target.checked } })}
            className="w-4 h-4 rounded cursor-pointer"
            style={{ accentColor: theme.couleur }}
          />
          <div>
            <span className="text-sm font-semibold text-gray-800">7j/7 et 24h/24</span>
            <p className="text-xs text-gray-400">Ouvert tous les jours, toute la journée</p>
          </div>
        </label>
 
        {/* Horaires par jour */}
        {!h24 && (
          <div className="space-y-2 border-t border-gray-100 pt-3">
            <p className="text-xs font-medium text-gray-500 mb-2">
              Cochez les jours d'ouverture et définissez les horaires de chaque jour
            </p>
 
            {JOURS_SEMAINE.map((j) => {
              const infos  = horairesParJour[j.key];
              const ouvert = infos?.ouvert === true;
              const debut  = infos?.debut  || '08:00';
              const fin    = infos?.fin    || '18:00';
 
              return (
                <div
                  key={j.key}
                  className={`rounded-xl border transition-all ${
                    ouvert ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50'
                  }`}
                >
                  {/* Ligne principale : checkbox + nom du jour */}
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    <input
                      type="checkbox" checked={ouvert}
                      onChange={() => toggleJour(j.key)}
                      className="w-4 h-4 rounded shrink-0 cursor-pointer"
                      style={{ accentColor: theme.couleur }}
                    />
                    <span
                      className={`text-sm font-semibold w-20 shrink-0 ${
                        ouvert ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {j.label}
                    </span>
 
                    {ouvert ? (
                      /* Sélecteurs horaires */
                      <div className="flex items-center gap-2 flex-1">
                        <select
                          value={debut}
                          onChange={(e) => updateHeure(j.key, 'debut', e.target.value)}
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                          style={{ accentColor: theme.couleur }}
                        >
                          {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                        <span className="text-gray-400 text-xs shrink-0">→</span>
                        <select
                          value={fin}
                          onChange={(e) => updateHeure(j.key, 'fin', e.target.value)}
                          className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none"
                        >
                          {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
                        </select>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic flex-1">Fermé</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
 
// ─── Questions Oui / Non ──────────────────────────────────────
function QuestionsOuiNon({ typeStructure, form, onChange, theme }) {
  const questions = QUESTIONS_ADDITIONNELLES[typeStructure] || [];
  if (questions.length === 0) return null;
 
  return (
    <div className="rounded-xl border border-gray-200 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-100 bg-gray-50">
        <p className="text-xs font-bold uppercase tracking-wider text-gray-500">
          Modules additionnels — répondez à chaque question
        </p>
      </div>
      <div className="divide-y divide-gray-100">
        {questions.map((q) => {
          const val = form[q.key];
          return (
            <div key={q.key} className="px-4 py-4">
              <p className="text-sm font-medium text-gray-800 mb-3 leading-relaxed">{q.label}</p>
              <div className="flex gap-3 flex-wrap">
                <button
                  type="button"
                  onClick={() => onChange(q.key)({ target: { value: true } })}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={val === true
                    ? { backgroundColor: theme.couleur, borderColor: theme.couleur, color: '#fff' }
                    : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${val === true ? 'border-white' : 'border-gray-300'}`}>
                    {val === true && <span className="w-2 h-2 rounded-full bg-white"/>}
                  </span>
                  Oui
                </button>
                <button
                  type="button"
                  onClick={() => onChange(q.key)({ target: { value: false } })}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all"
                  style={val === false
                    ? { backgroundColor: '#6b7280', borderColor: '#6b7280', color: '#fff' }
                    : { backgroundColor: '#fff', borderColor: '#e5e7eb', color: '#6b7280' }}
                >
                  <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${val === false ? 'border-white' : 'border-gray-300'}`}>
                    {val === false && <span className="w-2 h-2 rounded-full bg-white"/>}
                  </span>
                  Non
                </button>
                {val === true && (
                  <span className="self-center text-xs font-semibold px-3 py-1.5 rounded-full"
                    style={{ backgroundColor: theme.couleurClair, color: theme.couleur }}>
                    {q.active === 'services'    && '✓ Onglet Services activé'}
                    {q.active === 'medicaments' && '✓ Onglet Médicaments activé'}
                    {q.active === 'examens'     && '✓ Onglet Examens activé'}
                    {q.active === 'assurance'   && '✓ Onglet Assurances activé'}
                  </span>
                )}
                {val === false && (
                  <span className="self-center text-xs text-gray-400 italic">
                    {q.active === 'services'    && 'Pas d\'onglet Services'}
                    {q.active === 'medicaments' && 'Pas d\'onglet Médicaments'}
                    {q.active === 'examens'     && 'Pas d\'onglet Examens'}
                    {q.active === 'assurance'   && 'Pas d\'onglet Assurances'}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
 
// ═══════════════════════════════════════════════════════════
// ÉTAPE 1 — Choix du type
// ═══════════════════════════════════════════════════════════
function StepType({ onSelect }) {
  return (
    <div>
      <div className="text-center mb-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold mb-1">Étape 1 / 3</p>
        <h2 className="text-xl font-bold text-gray-900">Quel type d'établissement ?</h2>
        <p className="text-gray-500 text-sm mt-1">Sélectionnez pour voir les champs correspondants</p>
      </div>
 
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 flex items-start gap-2">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5"/>
        <p className="text-blue-700 text-xs leading-relaxed">
          <strong>Vous êtes médecin ?</strong> L'inscription des médecins se fait sur le site public.{' '}
          <a href={`${PUBLIC_URL}/inscription`} target="_blank" rel="noreferrer" className="font-bold underline">
            Cliquez ici →
          </a>
        </p>
      </div>
 
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
        {TYPES_LISTE.map((type) => {
          const theme = STRUCTURE_THEMES[type.value];
          return (
            <button
              key={type.value} type="button" onClick={() => onSelect(type.value)}
              className="flex items-center gap-3 p-4 rounded-xl border-2 border-gray-200 hover:shadow-md text-left transition-all"
            >
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
 
// ═══════════════════════════════════════════════════════════
// ÉTAPE 2 — Informations établissement
// ═══════════════════════════════════════════════════════════
function StepInfos({ typeStructure, form, onChange, onNext, onBack }) {
  const theme    = STRUCTURE_THEMES[typeStructure];
  const champs   = CHAMPS_SPECIFIQUES[typeStructure] || [];
  const questions = QUESTIONS_ADDITIONNELLES[typeStructure] || [];
  const allAnswered = questions.every((q) => form[q.key] === true || form[q.key] === false);
  const canContinue = form.nomLegal && form.telephone && form.ville && allAnswered;
 
  return (
    <div>
      <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: theme.couleurClair }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
          style={{ backgroundColor: theme.couleur + '25' }}>
          {theme.icone}
        </div>
        <div>
          <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-0.5">
            Étape 2 / 3 · {theme.label}
          </p>
          <p className="font-bold text-gray-900">Informations de l'établissement</p>
        </div>
      </div>
 
      <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-1">
        <Field label="Nom de l'établissement" name="nomLegal" required
          placeholder={`Ex: ${theme.label} de Yaoundé Centre`}
          value={form.nomLegal} onChange={onChange('nomLegal')}/>
 
        {/* Champs spécifiques */}
        {champs.length > 0 && (
          <div className="rounded-xl p-4 space-y-3 border"
            style={{ backgroundColor: theme.couleurClair, borderColor: theme.couleurMed + '40' }}>
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
              <Field label="Contact de l'accueil" name="telephone" required
                placeholder="+237 6XX XX XX XX" value={form.telephone} onChange={onChange('telephone')}/>
              <Field label="WhatsApp de l'établissement" name="whatsapp"
                placeholder="+237 6XX XX XX XX" value={form.whatsapp} onChange={onChange('whatsapp')}/>
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
 
        {/* Horaires par jour */}
        <SectionHoraires form={form} onChange={onChange} theme={theme}/>
 
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={onChange('description')} rows={2}
            placeholder={`Décrivez brièvement votre ${theme.label.toLowerCase()}...`}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"/>
        </div>
      </div>
 
      {!allAnswered && questions.length > 0 && (
        <p className="text-xs text-orange-500 mt-3 text-center">
          ⚠️ Veuillez répondre à toutes les questions (Oui ou Non) pour continuer.
        </p>
      )}
 
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
 
// ═══════════════════════════════════════════════════════════
// ÉTAPE 3 — Compte + CGU
// ═══════════════════════════════════════════════════════════
function StepCompte({ typeStructure, form, onChange, onSubmit, onBack, loading }) {
  const theme     = STRUCTURE_THEMES[typeStructure];
  const [acceptCGU, setAcceptCGU] = useState(false);
 
  const defaut    = MODULES_PAR_DEFAUT[typeStructure] || {};
  const questions = QUESTIONS_ADDITIONNELLES[typeStructure] || [];
  const modulesLabels = { services:'🏥 Services médicaux', medicaments:'💊 Médicaments', examens:'🔬 Examens', assurance:'🛡️ Assurances' };
  const modulesActifs = [];
  if (defaut.medicaments) modulesActifs.push(modulesLabels.medicaments);
  if (defaut.examens)     modulesActifs.push(modulesLabels.examens);
  if (defaut.services)    modulesActifs.push(modulesLabels.services);
  questions.forEach((q) => {
    const label = modulesLabels[q.active];
    if (form[q.key] === true && label && !modulesActifs.includes(label)) modulesActifs.push(label);
  });
 
  // Résumé horaires
  const h24 = form.horaire24h7j;
  const joursOuverts = h24 ? [] : JOURS_SEMAINE.filter((j) => form.horairesParJour?.[j.key]?.ouvert);
  const horairesResume = h24
    ? '7j/7 et 24h/24'
    : joursOuverts.length > 0
      ? joursOuverts.map((j) => {
          const h = form.horairesParJour[j.key];
          return `${j.labelCourt} ${h.debut}-${h.fin}`;
        }).join(', ')
      : 'Non défini';
 
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!acceptCGU) { toast.error("Acceptez les conditions d'utilisation."); return; }
    onSubmit();
  };
 
  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl" style={{ background: theme.couleurClair }}>
        <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
          style={{ backgroundColor: theme.couleur + '25' }}>
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
          <p className="text-xs font-bold uppercase tracking-wider mb-2" style={{ color: theme.couleur }}>
            Récapitulatif
          </p>
          {[
            { l:'Type',     v:`${theme.icone} ${theme.label}` },
            { l:'Nom',      v:form.nomLegal },
            { l:'Ville',    v:form.ville },
            { l:'Horaires', v:horairesResume },
          ].map(({ l, v }) => v && (
            <div key={l} className="flex items-start gap-2 text-xs text-gray-600">
              <Check size={11} className="mt-0.5 shrink-0" style={{ color: theme.couleur }}/>
              <span><strong>{l} :</strong> {v}</span>
            </div>
          ))}
          {modulesActifs.length > 0 && (
            <div className="pt-2 mt-1 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-1.5">Modules activés :</p>
              <div className="flex flex-wrap gap-1.5">
                {modulesActifs.map((m) => (
                  <span key={m} className="text-xs px-2.5 py-1 rounded-full text-white font-medium"
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
            J'accepte les conditions générales d'utilisation d'AZAMED et certifie que
            mon établissement exerce légalement au Cameroun.
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
 
// ═══════════════════════════════════════════════════════════
// COMPOSANT PRINCIPAL
// ═══════════════════════════════════════════════════════════
export default function RegisterPage() {
  const [step, setStep]          = useState(1);
  const [typeStructure, setType] = useState('');
  const [form, setForm]          = useState({
    nomLegal:'', telephone:'', whatsapp:'', adresse:'',
    pays:'Cameroun', ville:'', quartier:'', description:'',
    // Horaires
    horaire24h7j: false,
    horairesParJour: {
      lundi:    { ouvert:true,  debut:'08:00', fin:'18:00' },
      mardi:    { ouvert:true,  debut:'08:00', fin:'18:00' },
      mercredi: { ouvert:true,  debut:'08:00', fin:'18:00' },
      jeudi:    { ouvert:true,  debut:'08:00', fin:'18:00' },
      vendredi: { ouvert:true,  debut:'08:00', fin:'18:00' },
      samedi:   { ouvert:false, debut:'08:00', fin:'13:00' },
      dimanche: { ouvert:false, debut:'08:00', fin:'13:00' },
    },
    // Questions modules
    offresServices:undefined, faitExamens:undefined,
    dispenseMeds:undefined,   collaboreAssurance:undefined,
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
    setForm((prev) => ({
      ...prev,
      offresServices:undefined, faitExamens:undefined,
      dispenseMeds:undefined,   collaboreAssurance:undefined,
    }));
    setType(type);
    setStep(2);
  };
 
  const computeModules = () => {
    const def       = MODULES_PAR_DEFAUT[typeStructure] || {};
    const questions = QUESTIONS_ADDITIONNELLES[typeStructure] || [];
    const modules   = { ...def };
    questions.forEach((q) => {
      if (form[q.key] === true)  modules[q.active] = true;
      if (form[q.key] === false && !def[q.active]) modules[q.active] = false;
    });
    return modules;
  };
 
  const handleSubmit = async () => {
    setLoading(true);
    try {
      const modules = computeModules();
 
      // Construire horaires structurés pour le backend
      const horaires = form.horaire24h7j
        ? { mode: '24h/24 7j/7' }
        : {
            jours: JOURS_SEMAINE
              .filter((j) => form.horairesParJour?.[j.key]?.ouvert)
              .reduce((acc, j) => {
                const h = form.horairesParJour[j.key];
                acc[j.key] = { debut: h.debut, fin: h.fin };
                return acc;
              }, {}),
          };
 
      const { data } = await api.post('/auth/register', {
        ...form,
        typeStructure,
        modules,
        horairesJson: JSON.stringify(horaires),
        // Pour compatibilité backend
        horaire24h7j:   form.horaire24h7j,
        joursOuverture: JOURS_SEMAINE.filter((j) => form.horairesParJour?.[j.key]?.ouvert).map((j) => j.key),
        heureOuverture: '08:00',
        heureFermeture: '18:00',
      });
 
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
    <div className={`min-h-screen flex flex-col ${
      theme ? `bg-gradient-to-br ${theme.gradient}` : 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900'
    }`}>
      {/* Header */}
      <header className="border-b border-white/10 px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">AZ</span>
            </div>
            <span className="font-bold text-white">AZAMED Structures</span>
          </Link>
          <div className="flex items-center gap-2">
            {[1,2,3].map((s) => (
              <div key={s} className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                s < step ? 'bg-white text-gray-800'
                : s === step ? 'bg-white/90 text-gray-800 shadow-lg scale-110'
                : 'bg-white/20 text-white'
              }`}>
                {s < step ? <Check size={12}/> : s}
              </div>
            ))}
          </div>
        </div>
      </header>
 
      <div className="flex-1 px-4 py-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8">
            {step === 1 && <StepType onSelect={handleSelectType}/>}
            {step === 2 && (
              <StepInfos typeStructure={typeStructure} form={form}
                onChange={handleChange} onNext={() => setStep(3)} onBack={() => setStep(1)}/>
            )}
            {step === 3 && (
              <StepCompte typeStructure={typeStructure} form={form}
                onChange={handleChange} onSubmit={handleSubmit} onBack={() => setStep(2)} loading={loading}/>
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