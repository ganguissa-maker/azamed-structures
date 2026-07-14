// src/pages/PolitiqueConfidentialitePage.jsx
import { useState } from 'react';
import { ChevronUp } from 'lucide-react';

const SECTIONS = [
  { id:'intro',        label:'Introduction' },
  { id:'qui',          label:'1. Qui sommes-nous' },
  { id:'comptes',      label:'2. Les comptes concernés' },
  { id:'donnees',      label:'3. Données que nous collectons' },
  { id:'utilisation',  label:'4. Pourquoi nous les utilisons' },
  { id:'partage',      label:'5. Partage des données' },
  { id:'conservation', label:'6. Durée de conservation' },
  { id:'securite',     label:'7. Sécurité' },
  { id:'droits',       label:'8. Vos droits' },
  { id:'mineurs',      label:'9. Mineurs' },
  { id:'modifications',label:'10. Modifications de cette politique' },
  { id:'contact',      label:'11. Nous contacter' },
  { id:'glossaire',    label:'Glossaire des termes clés' },
];

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24 mb-10">
      <h2 className="text-xl font-bold text-gray-900 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="text-gray-600 text-sm leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

export default function PolitiqueConfidentialitePage() {
  const [showTop, setShowTop] = useState(false);

  return (
    <div className="bg-white">
      {/* En-tête */}
      <div className="bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto px-4 py-14">
          <h1 className="text-3xl sm:text-4xl font-extrabold mb-3">Politique de confidentialité</h1>
          <p className="text-gray-300 text-sm max-w-2xl leading-relaxed">
            Lorsque vous utilisez AZAMED, vous nous confiez des informations sensibles — votre santé,
            vos coordonnées, votre activité professionnelle. Ce document explique clairement quelles
            données nous collectons, pourquoi, et comment vous gardez le contrôle dessus.
          </p>
          <p className="text-gray-400 text-xs mt-4">Dernière mise à jour : 13 juillet 2026</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-10">

        {/* Sommaire */}
        <nav className="lg:sticky lg:top-6 lg:self-start bg-gray-50 rounded-2xl p-5 h-fit">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Sommaire</p>
          <ul className="space-y-1.5">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} className="text-sm text-gray-600 hover:text-primary-600 transition-colors block py-0.5">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* Contenu */}
        <div>
          <div id="intro" className="scroll-mt-24 bg-primary-50 border border-primary-100 rounded-2xl p-5 mb-10 text-sm text-primary-800 leading-relaxed">
            <p className="font-semibold mb-1">En bref</p>
            <p>
              AZAMED est une plateforme camerounaise qui met en relation patients, médecins, délégués
              médicaux et établissements de santé, sur mobile et sur le web. Nous collectons uniquement
              les données nécessaires au fonctionnement du service, nous ne les vendons jamais, et nous
              ne les partageons qu'avec les personnes strictement concernées (par exemple, votre numéro
              de téléphone n'est transmis à un médecin qu'une fois sa proposition de consultation validée).
            </p>
          </div>

          <Section id="qui" title="1. Qui sommes-nous">
            <p>
              AZAMED est édité par AZAMED (Cameroun). Pour toute question relative à cette politique
              ou à vos données personnelles : <strong>contactazamed98@gmail.com</strong>
            </p>
          </Section>

          <Section id="comptes" title="2. Les comptes concernés par cette politique">
            <p>AZAMED propose plusieurs types de comptes, accessibles depuis l'application mobile comme depuis le site web :</p>
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Patient / Utilisateur</strong> — recherche des établissements, médicaments, examens, services, et peut demander une consultation médicale.</li>
              <li><strong>Médecin</strong> — reçoit et répond aux demandes de consultation, gère son profil professionnel.</li>
              <li><strong>Délégué médical</strong> — dispose d'un espace de connexion dédié, pour proposer des médicaments au catalogue AZAMED.</li>
              <li><strong>Structure sanitaire</strong> — pharmacie, laboratoire, hôpital, clinique, cabinet médical ou autre établissement référencé sur AZAMED.</li>
            </ul>
          </Section>

          <Section id="donnees" title="3. Les données que nous collectons">
            <p className="font-semibold text-gray-800">3.1 Pour tous les comptes</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Adresse email</li>
              <li>Mot de passe (stocké chiffré, jamais en clair)</li>
              <li>Numéro de téléphone</li>
              <li>Ville et, le cas échéant, quartier</li>
            </ul>

            <p className="font-semibold text-gray-800 pt-2">3.2 Compte Patient</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prénom, nom</li>
              <li>Demandes de consultation (type, spécialité recherchée, description, adresse ou quartier)</li>
              <li>Historique des consultations demandées, proposées et confirmées</li>
            </ul>

            <p className="font-semibold text-gray-800 pt-2">3.3 Compte Médecin</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prénom, nom, spécialité</li>
              <li>Numéro d'ordre des médecins (vérification de votre identité professionnelle)</li>
              <li>Lieu d'exercice</li>
              <li>Statut de vérification (vérifié / en attente)</li>
            </ul>

            <p className="font-semibold text-gray-800 pt-2">3.4 Compte Délégué médical</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Prénom, nom</li>
              <li>Laboratoire représenté</li>
              <li>Ville et zone d'activité</li>
              <li>Statut de vérification du compte</li>
            </ul>

            <p className="font-semibold text-gray-800 pt-2">3.5 Compte Structure sanitaire</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Nom légal et nom commercial, type de structure, adresse, ville, quartier</li>
              <li>Documents d'autorisation d'exercice (numéro d'agrément ou d'autorisation selon le type)</li>
              <li>Horaires d'ouverture</li>
              <li>Catalogue de médicaments, examens ou services proposés, avec tarifs</li>
              <li>Photos et vidéos publiées dans les actualités de la structure</li>
              <li>Liste des assurances partenaires acceptées</li>
            </ul>

            <p className="font-semibold text-gray-800 pt-2">3.6 Données générées automatiquement</p>
            <ul className="list-disc pl-5 space-y-1">
              <li>Date de création de compte, dernière activité</li>
              <li>Notifications liées à votre activité (demande, proposition, validation de consultation)</li>
            </ul>

            <p className="bg-gray-50 rounded-xl p-3 text-gray-600 text-sm mt-3">
              📍 Nous ne collectons pas votre position GPS précise : seules la ville et le quartier
              renseignés manuellement sont utilisés.
            </p>
          </Section>

          <Section id="utilisation" title="4. Pourquoi nous utilisons vos données">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Créer et gérer votre compte, quel que soit votre rôle</li>
              <li>Vous permettre de rechercher des établissements, médicaments, examens ou services</li>
              <li>Mettre en relation patients et médecins pour une demande de consultation</li>
              <li>Permettre aux structures de publier des actualités (texte, photos, vidéos)</li>
              <li>Vous envoyer des notifications liées à votre activité</li>
              <li>Vérifier l'identité professionnelle des médecins, délégués médicaux, et la légitimité des structures avant validation</li>
              <li>Assurer la sécurité de la plateforme et prévenir les abus</li>
              <li>Répondre à vos demandes lorsque vous nous contactez</li>
            </ul>
            <p className="font-medium text-gray-800 pt-1">
              Nous n'utilisons jamais vos données à des fins de publicité ciblée et ne vendons aucune
              donnée personnelle à des tiers.
            </p>
          </Section>

          <Section id="partage" title="5. Partage des données">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Entre patient et médecin</strong> — le numéro de téléphone du patient est communiqué au médecin choisi uniquement après validation de sa proposition par le patient.</li>
              <li><strong>Profils publics</strong> — les informations professionnelles des médecins vérifiés et des structures (nom, adresse, horaires, catalogue, actualités) sont visibles publiquement, car c'est l'objet même du service.</li>
              <li><strong>Prestataires techniques</strong> — hébergement de nos données et fichiers chez des prestataires (ex. Railway), qui n'ont pas le droit d'utiliser vos données à d'autres fins.</li>
              <li><strong>Obligations légales</strong> — communication possible aux autorités compétentes si la loi camerounaise l'exige.</li>
            </ul>
          </Section>

          <Section id="conservation" title="6. Durée de conservation">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Les données de compte sont conservées tant que votre compte est actif.</li>
              <li>Les publications d'actualités des structures expirent et sont désactivées automatiquement après 24 heures.</li>
              <li>Vous pouvez demander la suppression de votre compte et de vos données à tout moment : contactazamed98@gmail.com</li>
            </ul>
          </Section>

          <Section id="securite" title="7. Sécurité de vos données">
            <ul className="list-disc pl-5 space-y-1.5">
              <li>Mots de passe chiffrés (hachage sécurisé), jamais stockés en clair</li>
              <li>Connexions sécurisées (HTTPS) entre l'application et nos serveurs</li>
              <li>Accès aux données restreint selon le rôle de chaque compte</li>
            </ul>
            <p>Aucun système n'étant infaillible à 100 %, nous nous engageons à corriger rapidement toute faille identifiée.</p>
          </Section>

          <Section id="droits" title="8. Vos droits">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong>Accès</strong> — consulter les données que nous détenons sur vous</li>
              <li><strong>Rectification</strong> — corriger des informations inexactes (les médecins et délégués médicaux peuvent modifier leur profil eux-mêmes depuis l'application)</li>
              <li><strong>Suppression</strong> — demander la suppression de votre compte et de vos données</li>
              <li><strong>Opposition</strong> — vous opposer à certains traitements de vos données</li>
            </ul>
            <p>Pour exercer ces droits : contactazamed98@gmail.com. Nous répondrons dans un délai raisonnable.</p>
          </Section>

          <Section id="mineurs" title="9. Mineurs">
            <p>
              AZAMED n'est pas destiné aux enfants de moins de 18 ans. Nous ne collectons pas
              sciemment de données concernant des mineurs. Si vous pensez qu'un compte a été créé
              par un mineur, contactez-nous afin que nous puissions le supprimer.
            </p>
          </Section>

          <Section id="modifications" title="10. Modifications de cette politique">
            <p>
              Cette politique peut être mise à jour pour refléter des évolutions du service ou de la
              réglementation. La date de dernière mise à jour figure en haut de cette page. En cas de
              changement important, nous vous en informerons via l'application.
            </p>
          </Section>

          <Section id="contact" title="11. Nous contacter">
            <p>📧 <strong>contactazamed98@gmail.com</strong></p>
          </Section>

          <Section id="glossaire" title="Glossaire des termes clés">
            <dl className="space-y-3">
              <div>
                <dt className="font-semibold text-gray-800">Compte</dt>
                <dd>Espace personnel créé avec un email et un mot de passe, permettant d'accéder aux services AZAMED selon votre rôle (patient, médecin, délégué médical ou structure).</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-800">Structure sanitaire</dt>
                <dd>Établissement de santé référencé sur AZAMED : pharmacie, laboratoire, hôpital, clinique, cabinet médical, centre d'imagerie, etc.</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-800">Proposition de consultation</dt>
                <dd>Réponse d'un médecin à une demande de consultation d'un patient, précisant le lieu, la date et le tarif proposés.</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-800">Numéro d'ordre</dt>
                <dd>Numéro d'inscription officiel d'un médecin, utilisé par AZAMED pour vérifier son identité professionnelle avant de valider son compte.</dd>
              </div>
              <div>
                <dt className="font-semibold text-gray-800">Données personnelles</dt>
                <dd>Toute information permettant de vous identifier directement ou indirectement (nom, email, téléphone, etc.).</dd>
              </div>
            </dl>
          </Section>

          <a href="#intro" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:underline">
            <ChevronUp size={15}/> Retour en haut
          </a>
        </div>
      </div>
    </div>
  );
}