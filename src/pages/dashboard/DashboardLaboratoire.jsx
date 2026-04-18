// src/pages/dashboard/DashboardLaboratoire.jsx
import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

export default function DashboardLaboratoire() {
  const { user }    = useAuthStore();
  const structureId = user?.structure?.id;
  const [catalogue, setCatalogue] = useState({});
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
          api.get('/laboratoires/catalogue/examens'),
          api.get(`/laboratoires/${structureId}/examens?limit=500`),
        ]);
        setCatalogue(catRes.data.grouped || {});
        const map = {};
        (stockRes.data.data || []).forEach((e) => {
          map[e.examenId] = { disponible: e.disponible, prix: e.prix, delaiMin: e.delaiMin, delaiMax: e.delaiMax };
        });
        setStocks(map);
      } catch { toast.error('Erreur chargement examens'); }
      finally { setLoading(false); }
    })();
  }, [structureId]);

  const save = async (examenId, patch) => {
    setSaving(examenId);
    const updated = { ...(stocks[examenId] || {}), ...patch };
    try {
      await api.put(`/laboratoires/${structureId}/examens`, { updates: [{ examenId, ...updated }] });
      setStocks((prev) => ({ ...prev, [examenId]: updated }));
    } catch { toast.error('Erreur sauvegarde'); }
    finally { setSaving(null); }
  };

  const totalExamens = Object.values(catalogue).flat().length;
  const filteredGrouped = Object.entries(catalogue).reduce((acc, [cat, exs]) => {
    const q = search.toLowerCase();
    const f = exs.filter((e) => e.nom.toLowerCase().includes(q) || e.categorie.toLowerCase().includes(q));
    if (f.length > 0) acc[cat] = f;
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
          <h1 className="text-xl font-bold text-gray-900">Examens médicaux</h1>
          <p className="text-sm text-gray-500">{totalExamens} examens dans la base AZAMED</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Rechercher un examen..." value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-primary-400" />
        </div>
      </div>
      <p className="text-xs text-gray-400 mb-4">Activez les examens que vous réalisez, renseignez le prix (FCFA) et le délai de rendu en heures.</p>

      {Object.entries(filteredGrouped).map(([cat, exs]) => (
        <div key={cat} className="mb-5">
          <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2 py-1 mb-2 bg-gray-50 rounded-lg">
            {cat} ({exs.length})
          </h2>
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="hidden sm:grid grid-cols-12 gap-2 px-4 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-100">
              <div className="col-span-5">Examen</div>
              <div className="col-span-2 text-center">Disponible</div>
              <div className="col-span-2">Prix (FCFA)</div>
              <div className="col-span-3">Délai résultats</div>
            </div>
            {exs.map((ex, idx) => {
              const s = stocks[ex.id] || {};
              return (
                <div key={ex.id}
                  className={`grid grid-cols-12 gap-2 items-center px-4 py-3 ${idx % 2 === 0 ? '' : 'bg-gray-50/40'} border-b border-gray-50 last:border-0`}>
                  <div className="col-span-12 sm:col-span-5 min-w-0">
                    <p className="font-medium text-sm text-gray-900">{ex.nom}</p>
                    <p className="text-xs text-gray-400">{ex.codeAzamed}</p>
                  </div>
                  <div className="col-span-4 sm:col-span-2 flex flex-col items-center gap-1">
                    <span className="text-xs text-gray-400 sm:hidden">Disponible</span>
                    <button disabled={saving === ex.id}
                      onClick={() => save(ex.id, { disponible: !s.disponible })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${s.disponible ? 'bg-green-500' : 'bg-gray-200'} disabled:opacity-60`}>
                      <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${s.disponible ? 'left-6' : 'left-1'}`} />
                    </button>
                  </div>
                  <div className="col-span-4 sm:col-span-2">
                    <input type="number" placeholder="Prix" min="0"
                      defaultValue={s.prix || ''} key={`p-${ex.id}-${s.prix}`}
                      onBlur={(e) => { const v = parseFloat(e.target.value)||null; if (v !== s.prix) save(ex.id, { prix: v }); }}
                      className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-primary-400" />
                  </div>
                  <div className="col-span-4 sm:col-span-3 flex items-center gap-1">
                    <input type="number" placeholder="Min" min="0"
                      defaultValue={s.delaiMin || ''} key={`dmin-${ex.id}-${s.delaiMin}`}
                      onBlur={(e) => { const v = parseInt(e.target.value)||null; if (v !== s.delaiMin) save(ex.id, { delaiMin: v }); }}
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right focus:outline-none focus:border-primary-400" />
                    <span className="text-xs text-gray-400">à</span>
                    <input type="number" placeholder="Max" min="0"
                      defaultValue={s.delaiMax || ''} key={`dmax-${ex.id}-${s.delaiMax}`}
                      onBlur={(e) => { const v = parseInt(e.target.value)||null; if (v !== s.delaiMax) save(ex.id, { delaiMax: v }); }}
                      className="w-16 px-2 py-1.5 border border-gray-200 rounded-lg text-xs text-right focus:outline-none focus:border-primary-400" />
                    <span className="text-xs text-gray-400">h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
      {Object.keys(filteredGrouped).length === 0 && (
        <p className="text-center py-16 text-gray-400">Aucun résultat pour « {search} »</p>
      )}
    </div>
  );
}
