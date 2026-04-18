// src/pages/admin/AdminMedicaments.jsx
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import api from '../../utils/api';

export default function AdminMedicaments() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    nomCommercial: '', dci: '', classeTherapeutique: '',
    forme: '', dosage: '', laboratoireFabricant: '',
  });

  const { data } = useQuery({
    queryKey: ['admin-meds'],
    queryFn: async () => { const { data } = await api.get('/pharmacies/catalogue/medicaments?limit=300'); return data; },
  });

  const { mutate: add, isPending } = useMutation({
    mutationFn: () => api.post('/admin/medicaments', form),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-meds']);
      setForm({ nomCommercial:'', dci:'', classeTherapeutique:'', forme:'', dosage:'', laboratoireFabricant:'' });
      setShowForm(false);
      toast.success('Médicament ajouté au catalogue !');
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Catalogue médicaments</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors">
          <Plus size={16}/> Ajouter un médicament
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 border-primary-200">
          <h2 className="font-semibold text-gray-900 mb-4">Nouveau médicament</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {[
              { f:'nomCommercial',       l:'Nom commercial *' },
              { f:'dci',                l:'DCI (principe actif) *' },
              { f:'classeTherapeutique',l:'Classe thérapeutique' },
              { f:'forme',              l:'Forme (comprimé, sirop...)' },
              { f:'dosage',             l:'Dosage' },
              { f:'laboratoireFabricant',l:'Laboratoire fabricant' },
            ].map(({ f, l }) => (
              <div key={f}>
                <label className="block text-xs font-medium text-gray-600 mb-1">{l}</label>
                <input type="text" value={form[f]} onChange={set(f)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button onClick={() => add()} disabled={isPending || !form.nomCommercial || !form.dci}
              className="bg-primary-600 text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary-700 transition-colors disabled:opacity-50">
              {isPending ? 'Ajout...' : 'Ajouter au catalogue'}
            </button>
            <button onClick={() => setShowForm(false)} className="px-5 py-2 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50">
              Annuler
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <p className="text-sm text-gray-500 mb-4">{data?.pagination?.total || 0} médicaments dans la base</p>
        <div className="space-y-1">
          {data?.data?.map((med) => (
            <div key={med.id} className="flex items-center gap-3 py-2.5 border-b border-gray-50 last:border-0">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-gray-900">{med.nomCommercial}</p>
                <p className="text-xs text-gray-400">{med.dci} · {med.classeTherapeutique}</p>
              </div>
              <span className="text-xs text-gray-400 shrink-0">{med.forme} {med.dosage}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
