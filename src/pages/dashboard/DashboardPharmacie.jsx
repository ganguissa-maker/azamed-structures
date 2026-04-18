// src/pages/dashboard/DashboardPharmacie.jsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function DashboardPharmacie() {
  const { user }      = useAuthStore();
  const structureId   = user?.structure?.id;
  const [catalogue, setCatalogue] = useState([]);
  const [stocks, setStocks]       = useState({});
  const [search, setSearch]       = useState('');
  const [loading, setLoading]     = useState(true);
  const [saving, setSaving]       = useState(null);

  useEffect(() => {
    if (!structureId) return;
    (async () => {
      setLoading(true);
      try {
        const [catRes, stockRes] = await Promise.all([
          api.get('/pharmacies/catalogue/medicaments?limit=500'),
          api.get(`/pharmacies/${structureId}/medicaments?limit=500`),
        ]);
        setCatalogue(catRes.data.data || []);
        const map = {};
        (stockRes.data.data || []).forEach((s) => {
          map[s.medicamentId] = { disponible: s.disponible, enStock: s.enStock, prix: s.prix, deGarde: s.deGarde };
        });
        setStocks(map);
      } catch { toast.error('Erreur chargement médicaments'); }
      finally { setLoading(false); }
    })();
  }, [structureId]);

  const save = async (medicamentId, patch) => {
    setSaving(medicamentId);
    const updated = { ...(stocks[medicamentId] || {}), ...patch };
    try {
      await api.put(`/pharmacies/${structureId}/medicaments/${medicamentId}`, updated);
      setStocks((prev) => ({ ...prev, [medicamentId]: updated }));
    } catch { toast.error('Erreur sauvegarde'); }
    finally { setSaving(null); }
  };

  const filtered = catalogue.filter((m) => {
    const q = search.toLowerCase();
    return m.nomCommercial.toLowerCase().includes(q) ||
           m.dci.toLowerCase().includes(q) ||
           (m.classeTherapeutique || '').toLowerCase().includes(q);
  });

  const grouped = filtered.reduce((acc, m) => {
    const key = m.classeTherapeutique || 'Autres';
    if (!acc[key]) acc[key] = [];
    acc[key].push(m);
    return acc;
  }, {});

  if (loading) return (
    <div className="flex justify-center items-center py-20">
      <div className="w-8 h-8 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Médicaments</h1>
          <p className="text-sm text-gray-500">{catalogue.length} médicaments dans la base AZAMED</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher médicament, DCI..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">Activez les médicaments disponibles dans votre pharmacie et renseignez les prix en FCFA.</p>

      {Object.entries(grouped).map(([classe, meds]) => (
        <div key={classe} className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1 mb-2 bg-gray-50 rounded-lg">
            {classe} ({meds.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
              <div className="col-span-5">Médicament</div>
              <div className="col-span-2 text-center">Disponible</div>
              <div className="col-span-2 text-center">En stock</div>
              <div className="col-span-2">Prix (FCFA)</div>
              <div className="col-span-1 text-center">Garde</div>
            </div>
            {meds.map((med, idx) => {
              const s = stocks[med.id] || {};
              return (
                <div key={med.id}
                  className={`grid grid-cols-12 gap-2 items-center px-4 py-3 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'} border-b border-gray-50 last:border-0`}>
                  <div className="col-span-12 sm:col-span-5 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{med.nomCommercial}</p>
                    <p className="text-xs text-gray-400">{med.dci} · {med.forme} {med.dosage}</p>
                  </div>
                  {/* Disponible */}
                  <div className="col-span-4 sm:col-span-2 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400 sm:hidden">Disponible</span>
                    <button disabled={saving === med.id}
                      onClick={() => save(med.id, { disponible: !s.disponible })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${s.disponible ? 'bg-green-500' : 'bg-gray-200'} disabled:opacity-60`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${s.disponible ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  {/* En stock */}
                  <div className="col-span-4 sm:col-span-2 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400 sm:hidden">En stock</span>
                    <button disabled={saving === med.id || !s.disponible}
                      onClick={() => save(med.id, { enStock: !s.enStock })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${s.enStock ? 'bg-blue-500' : 'bg-gray-200'} disabled:opacity-40`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${s.enStock ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  {/* Prix */}
                  <div className="col-span-4 sm:col-span-2">
                    <input type="number" placeholder="Prix" min="0"
                      defaultValue={s.prix || ''} key={`p-${med.id}-${s.prix}`}
                      onBlur={(e) => { const v = parseFloat(e.target.value)||null; if (v !== s.prix) save(med.id, { prix: v }); }}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-primary-400" />
                  </div>
                  {/* Garde */}
                  <div className="col-span-12 sm:col-span-1 flex justify-center">
                    <label className="flex items-center gap-1 cursor-pointer" title="Pharmacie de garde">
                      <input type="checkbox" checked={s.deGarde || false}
                        onChange={(e) => save(med.id, { deGarde: e.target.checked })}
                        className="w-4 h-4 accent-orange-500" />
                      <span className="text-xs text-gray-500 sm:hidden">Garde</span>
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {filtered.length === 0 && (
        <p className="text-center py-16 text-gray-400">Aucun médicament trouvé pour « {search} »</p>
      )}
    </div>
  );
}
