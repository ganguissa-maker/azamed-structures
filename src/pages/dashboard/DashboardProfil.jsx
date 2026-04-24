// src/pages/dashboard/DashboardProfil.jsx — Profil avec thème couleur
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Save, Phone, MapPin, Clock, Mail, FileText } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import { STRUCTURE_THEMES, HEURES } from '../../utils/structureThemes';
import api from '../../utils/api';

export default function DashboardProfil() {
  const { user, login } = useAuthStore();
  const structure       = user?.structure;
  const typeStructure   = structure?.typeStructure || '';
  const theme           = STRUCTURE_THEMES[typeStructure] || { couleur:'#0284c7', couleurClair:'#e0f2fe', icone:'🏥', label:'Structure' };

  const [form, setForm] = useState({
    telephone:      structure?.telephone      || '',
    whatsapp:       structure?.whatsapp       || '',
    adresse:        structure?.adresse        || '',
    quartier:       structure?.quartier       || '',
    ville:          structure?.ville          || '',
    description:    structure?.description    || '',
    heureOuverture: structure?.heureOuverture || '08:00',
    heureFermeture: structure?.heureFermeture || '18:00',
  });
  const [editing, setEditing] = useState(false);

  const set = (f) => (e) => { const v = e.target.value; setForm((p) => ({ ...p, [f]: v })); };

  const { mutate: save, isPending } = useMutation({
    mutationFn: () => api.put(`/structures/${structure.id}`, form),
    onSuccess: ({ data }) => {
      login({ ...user, structure: data }, localStorage.getItem('azamed_token'));
      setEditing(false);
      toast.success('Profil mis à jour !');
    },
    onError: () => toast.error('Erreur lors de la mise à jour.'),
  });

  const infos = [
    { icon:<Phone size={15}/>,   label:'Téléphone',   value:structure?.telephone },
    { icon:<Phone size={15}/>,   label:'WhatsApp',    value:structure?.whatsapp },
    { icon:<MapPin size={15}/>,  label:'Adresse',     value:[structure?.adresse, structure?.quartier, structure?.ville].filter(Boolean).join(', ') },
    { icon:<Clock size={15}/>,   label:'Horaires',    value:structure?.heureOuverture ? `${structure.heureOuverture} – ${structure.heureFermeture}` : 'Non renseigné' },
    { icon:<FileText size={15}/>,label:'Description', value:structure?.description },
  ];

  return (
    <div>
      {/* Header profil */}
      <div className="rounded-2xl p-6 mb-6 flex items-center gap-4 relative overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${theme.couleur}, ${theme.couleur}bb)` }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-6xl opacity-20 select-none">{theme.icone}</div>
        <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center shrink-0">
          <span className="text-white font-extrabold text-2xl">
            {(structure?.nomCommercial || structure?.nomLegal)?.charAt(0)}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white/70 text-xs uppercase tracking-wider">{theme.icone} {theme.label}</p>
          <h1 className="text-lg font-bold text-white truncate">{structure?.nomCommercial || structure?.nomLegal}</h1>
          <p className="text-white/70 text-sm">{structure?.ville}</p>
          <div className="flex items-center gap-2 mt-1">
            {structure?.isVerified
              ? <span className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full">✓ Vérifié</span>
              : <span className="text-xs bg-white/10 text-white/70 px-2 py-0.5 rounded-full">⏳ En attente</span>}
          </div>
        </div>
      </div>

      {/* Informations */}
      {!editing ? (
        <div className="card mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-gray-900">Mes informations</h2>
            <button onClick={() => setEditing(true)}
              className="text-sm font-medium px-4 py-2 rounded-xl transition-colors text-white"
              style={{ backgroundColor: theme.couleur }}>
              Modifier
            </button>
          </div>
          <div className="space-y-3">
            {infos.map((info) => (
              <div key={info.label} className="flex items-start gap-3 py-2 border-b border-gray-50 last:border-0">
                <div className="mt-0.5 shrink-0" style={{ color: theme.couleur }}>{info.icon}</div>
                <div>
                  <p className="text-xs text-gray-400">{info.label}</p>
                  <p className="text-sm font-medium text-gray-900">{info.value || <span className="text-gray-400 italic">Non renseigné</span>}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card mb-4" style={{ borderTop: `3px solid ${theme.couleur}` }}>
          <h2 className="font-bold text-gray-900 mb-4">Modifier mes informations</h2>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { f:'telephone',  l:'Téléphone',   ph:'+237 6XX XX XX XX' },
                { f:'whatsapp',   l:'WhatsApp',    ph:'+237 6XX XX XX XX' },
                { f:'quartier',   l:'Quartier',    ph:'Ex: Bastos' },
                { f:'ville',      l:'Ville',       ph:'Ex: Yaoundé' },
              ].map(({ f, l, ph }) => (
                <div key={f}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{l}</label>
                  <input type="text" value={form[f]} onChange={set(f)} placeholder={ph}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
                </div>
              ))}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse complète</label>
              <input type="text" value={form.adresse} onChange={set('adresse')} placeholder="Rue, numéro..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none"/>
            </div>

            {/* Horaires */}
            <div className="rounded-xl p-4 border" style={{ backgroundColor: theme.couleurClair, borderColor: theme.couleur + '30' }}>
              <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: theme.couleur }}>
                🕐 Horaires d'ouverture
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ouverture</label>
                  <select value={form.heureOuverture} onChange={set('heureOuverture')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                    {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Fermeture</label>
                  <select value={form.heureFermeture} onChange={set('heureFermeture')}
                    className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none">
                    {HEURES.map((h) => <option key={h} value={h}>{h}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={set('description')} rows={3}
                placeholder="Décrivez votre établissement..."
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none resize-none"/>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={() => setEditing(false)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
                Annuler
              </button>
              <button onClick={() => save()} disabled={isPending}
                className="flex items-center gap-2 px-6 py-2.5 text-white rounded-xl text-sm font-semibold disabled:opacity-60 transition-colors"
                style={{ backgroundColor: theme.couleur }}>
                <Save size={15}/> {isPending ? 'Sauvegarde...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Info vérification */}
      {!structure?.isVerified && (
        <div className="card border border-orange-200 bg-orange-50">
          <p className="text-sm font-semibold text-orange-800 mb-1">⏳ Vérification en attente</p>
          <p className="text-xs text-orange-600 leading-relaxed">
            Pour accélérer la vérification de votre établissement, envoyez vos documents (autorisation, agrément) à{' '}
            <a href="mailto:contactazamed@gmail.com" className="font-bold underline">contactazamed@gmail.com</a>
          </p>
        </div>
      )}
    </div>
  );
}
