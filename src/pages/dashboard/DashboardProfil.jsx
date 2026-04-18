// src/pages/dashboard/DashboardProfil.jsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

// ✅ EN DEHORS du composant — évite la perte de focus
function Field({ label, name, type, value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <input type={type || 'text'} name={name} value={value} onChange={onChange}
        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 transition-colors" />
    </div>
  );
}

export default function DashboardProfil() {
  const { user, updateUser } = useAuthStore();
  const s = user?.structure;

  const [form, setForm] = useState({
    nomCommercial: s?.nomCommercial || '',
    nomLegal:      s?.nomLegal      || '',
    telephone:     s?.telephone     || '',
    whatsapp:      s?.whatsapp      || '',
    email:         s?.email         || '',
    adresse:       s?.adresse       || '',
    ville:         s?.ville         || '',
    quartier:      s?.quartier      || '',
    description:   s?.description   || '',
  });

  const handleChange = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const { mutate, isPending } = useMutation({
    mutationFn: () => api.put(`/structures/${s.id}`, form),
    onSuccess: ({ data }) => {
      updateUser({ ...user, structure: data.structure });
      toast.success('Profil mis à jour !');
    },
    onError: () => toast.error('Erreur lors de la mise à jour'),
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Mon profil</h1>
      <div className="card">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nom commercial"  name="nomCommercial" value={form.nomCommercial} onChange={handleChange('nomCommercial')} />
          <Field label="Nom légal"       name="nomLegal"      value={form.nomLegal}      onChange={handleChange('nomLegal')} />
          <Field label="Téléphone"       name="telephone"     value={form.telephone}     onChange={handleChange('telephone')} />
          <Field label="WhatsApp"        name="whatsapp"      value={form.whatsapp}      onChange={handleChange('whatsapp')} />
          <Field label="Email"           name="email" type="email" value={form.email}    onChange={handleChange('email')} />
          <Field label="Adresse"         name="adresse"       value={form.adresse}       onChange={handleChange('adresse')} />
          <Field label="Ville"           name="ville"         value={form.ville}         onChange={handleChange('ville')} />
          <Field label="Quartier"        name="quartier"      value={form.quartier}      onChange={handleChange('quartier')} />
        </div>
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          <textarea value={form.description} onChange={handleChange('description')} rows={3}
            className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400 resize-none" />
        </div>
        <button onClick={() => mutate()} disabled={isPending}
          className="mt-6 bg-primary-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-primary-700 transition-colors disabled:opacity-60">
          {isPending ? 'Enregistrement...' : 'Enregistrer les modifications'}
        </button>
      </div>
    </div>
  );
}
