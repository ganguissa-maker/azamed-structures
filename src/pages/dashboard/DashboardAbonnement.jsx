// src/pages/dashboard/DashboardAbonnement.jsx
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, Star } from 'lucide-react';
import { toast } from '../../components/ui/Toaster';
import useAuthStore from '../../store/authStore';
import api from '../../utils/api';

const PLANS = [
  {
    niveau: 'BASIC', label: 'Basic', prix: 'Gratuit', couleur: 'border-gray-200',
    avantages: ['Fiche publique complète','Présence sur la carte','1 publication / semaine','Apparaît en dernière position'],
  },
  {
    niveau: 'PREMIUM1', label: 'Premium 1', prix: '15 000 FCFA / mois', couleur: 'border-purple-300 ring-2 ring-purple-100',
    avantages: ['2 publications / jour','Badge Premium','Mis en avant dans les résultats','Statistiques (vues, clics, appels)','Liens externes'],
  },
  {
    niveau: 'PREMIUM2', label: 'Premium 2', prix: '35 000 FCFA / mois', couleur: 'border-amber-300 ring-2 ring-amber-100',
    avantages: ['5 publications / jour','Badge Premium+','Position n°1 dans les résultats','Statistiques complètes','Vidéos promotionnelles','1 post épinglé','Support prioritaire'],
  },
];

export default function DashboardAbonnement() {
  const { user }   = useAuthStore();
  const niveauActuel = user?.structure?.abonnements?.[0]?.niveau || 'BASIC';

  const { mutate: initier, isPending } = useMutation({
    mutationFn: (niveau) => api.post('/abonnements/initier', { niveau }),
    onSuccess: ({ data }) => {
      if (data.paymentUrl) window.open(data.paymentUrl, '_blank');
      else toast.info(`Réf. transaction : ${data.transactionId}. Contactez-nous pour finaliser le paiement.`);
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Erreur'),
  });

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-2">Mon abonnement</h1>
      <p className="text-sm text-gray-500 mb-8">
        Plan actuel : <span className="font-semibold text-primary-600">{niveauActuel}</span>
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((plan) => {
          const estActuel = plan.niveau === niveauActuel;
          return (
            <div key={plan.niveau} className={`card border-2 ${plan.couleur} flex flex-col`}>
              <div className="flex items-center gap-2 mb-1">
                {plan.niveau === 'PREMIUM2' && <Star size={16} className="text-amber-500" />}
                <h2 className="font-bold text-gray-900">{plan.label}</h2>
              </div>
              <p className="text-lg font-bold text-primary-600 mb-4">{plan.prix}</p>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.avantages.map((a) => (
                  <li key={a} className="flex items-start gap-2 text-sm text-gray-600">
                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" /> {a}
                  </li>
                ))}
              </ul>
              {estActuel ? (
                <div className="text-center text-sm font-semibold text-green-600 bg-green-50 py-2.5 rounded-xl">✓ Plan actuel</div>
              ) : plan.niveau === 'BASIC' ? (
                <div className="text-center text-sm text-gray-400 bg-gray-50 py-2.5 rounded-xl">Gratuit</div>
              ) : (
                <button onClick={() => initier(plan.niveau)} disabled={isPending}
                  className="bg-primary-600 text-white py-2.5 rounded-xl w-full font-semibold hover:bg-primary-700 transition-colors disabled:opacity-60">
                  {isPending ? '...' : `Passer en ${plan.label}`}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
        💳 Paiements acceptés : <strong>MTN Mobile Money</strong>, <strong>Orange Money</strong>, virement bancaire.
      </div>
    </div>
  );
}
