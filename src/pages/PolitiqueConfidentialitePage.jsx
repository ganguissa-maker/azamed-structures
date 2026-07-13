// src/pages/PolitiqueConfidentialitePage.jsx
export default function PolitiqueConfidentialitePage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12 prose prose-sm sm:prose-base">
      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Politique de confidentialité</h1>
      <p className="text-gray-400 text-sm mb-8">Dernière mise à jour : 13 juillet 2026</p>

      <p>
        AZAMED ("nous", "notre", "l'application") est une plateforme camerounaise qui met en
        relation les patients, les médecins, les délégués médicaux et les établissements de
        santé (pharmacies, laboratoires, hôpitaux, cliniques, cabinets médicaux), via une
        application mobile et un site web.
      </p>
      <p>
        Cette politique explique quelles données nous collectons, pourquoi, comment elles sont
        utilisées, et quels droits vous avez sur vos données — quel que soit le type de compte
        que vous utilisez et que vous accédiez à AZAMED depuis l'application mobile ou le site web.
      </p>

      <h2>1. Qui sommes-nous</h2>
      <p>
        AZAMED est édité par AZAMED (Cameroun). Pour toute question relative à cette politique
        ou à vos données personnelles : <strong>contactazamed98@gmail.com</strong>
      </p>

      <h2>2. Les comptes concernés par cette politique</h2>
      <p>AZAMED propose plusieurs types de comptes, sur mobile comme sur le web :</p>
      <ul>
        <li><strong>Patient / Utilisateur</strong> — recherche des établissements, médicaments, examens, services, et peut demander une consultation médicale.</li>
        <li><strong>Médecin</strong> — reçoit et répond aux demandes de consultation, gère son profil professionnel.</li>
        <li><strong>Délégué médical</strong> — dispose d'un espace de connexion dédié, au même titre que les médecins, pour son activité professionnelle sur la plateforme.</li>
        <li><strong>Structure sanitaire</strong> — pharmacie, laboratoire, hôpital, clinique, cabinet médical ou autre établissement référencé sur AZAMED.</li>
      </ul>

      <h2>3. Les données que nous collectons</h2>

      <h3>3.1 Pour tous les comptes</h3>
      <ul>
        <li>Adresse email</li>
        <li>Mot de passe (stocké chiffré, jamais en clair)</li>
        <li>Numéro de téléphone</li>
        <li>Ville et, le cas échéant, quartier</li>
      </ul>

      <h3>3.2 Compte Patient</h3>
      <ul>
        <li>Prénom, nom</li>
        <li>Demandes de consultation (type, spécialité recherchée, description, adresse ou quartier)</li>
        <li>Historique des consultations demandées, proposées et confirmées</li>
      </ul>

      <h3>3.3 Compte Médecin</h3>
      <ul>
        <li>Prénom, nom, spécialité</li>
        <li>Numéro d'ordre des médecins (vérification de votre identité professionnelle)</li>
        <li>Lieu d'exercice</li>
        <li>Statut de vérification (vérifié / en attente)</li>
      </ul>

      <h3>3.4 Compte Délégué médical</h3>
      <ul>
        <li>Prénom, nom</li>
        <li>Structure ou laboratoire représenté</li>
        <li>Ville et zone d'activité</li>
        <li>Statut de vérification du compte</li>
      </ul>

      <h3>3.5 Compte Structure sanitaire</h3>
      <ul>
        <li>Nom légal et nom commercial, type de structure, adresse, ville, quartier</li>
        <li>Documents d'autorisation d'exercice (numéro d'agrément ou d'autorisation selon le type)</li>
        <li>Horaires d'ouverture</li>
        <li>Catalogue de médicaments, examens ou services proposés, avec tarifs</li>
        <li>Photos et vidéos publiées dans les actualités de la structure</li>
        <li>Liste des assurances partenaires acceptées</li>
      </ul>

      <h3>3.6 Données générées automatiquement</h3>
      <ul>
        <li>Date de création de compte, dernière activité</li>
        <li>Notifications liées à votre activité (demande, proposition, validation de consultation)</li>
      </ul>
      <p>Nous ne collectons pas votre position GPS précise : seules la ville et le quartier renseignés manuellement sont utilisés.</p>

      <h2>4. Pourquoi nous utilisons vos données</h2>
      <ul>
        <li>Créer et gérer votre compte, quel que soit votre rôle</li>
        <li>Vous permettre de rechercher des établissements, médicaments, examens ou services</li>
        <li>Mettre en relation patients et médecins pour une demande de consultation</li>
        <li>Permettre aux structures de publier des actualités (texte, photos, vidéos)</li>
        <li>Vous envoyer des notifications liées à votre activité</li>
        <li>Vérifier l'identité professionnelle des médecins, délégués médicaux et la légitimité des structures avant validation</li>
        <li>Assurer la sécurité de la plateforme et prévenir les abus</li>
        <li>Répondre à vos demandes lorsque vous nous contactez</li>
      </ul>
      <p>Nous n'utilisons jamais vos données à des fins de publicité ciblée et ne vendons aucune donnée personnelle à des tiers.</p>

      <h2>5. Partage des données</h2>
      <ul>
        <li><strong>Entre patient et médecin</strong> : le numéro de téléphone du patient est communiqué au médecin choisi uniquement après validation de sa proposition par le patient.</li>
        <li><strong>Profils publics</strong> : les informations professionnelles des médecins vérifiés et des structures (nom, adresse, horaires, catalogue, actualités) sont visibles publiquement — c'est l'objet même du service.</li>
        <li><strong>Prestataires techniques</strong> : hébergement de nos données et fichiers chez des prestataires (ex. Railway), qui n'ont pas le droit d'utiliser vos données à d'autres fins.</li>
        <li><strong>Obligations légales</strong> : communication possible aux autorités compétentes si la loi camerounaise l'exige.</li>
      </ul>

      <h2>6. Durée de conservation</h2>
      <ul>
        <li>Les données de compte sont conservées tant que votre compte est actif.</li>
        <li>Les publications d'actualités des structures expirent automatiquement après 24 heures.</li>
        <li>Vous pouvez demander la suppression de votre compte à tout moment : contactazamed98@gmail.com</li>
      </ul>

      <h2>7. Sécurité</h2>
      <ul>
        <li>Mots de passe chiffrés (hachage sécurisé)</li>
        <li>Connexions sécurisées (HTTPS)</li>
        <li>Accès aux données restreint selon le rôle de chaque compte</li>
      </ul>

      <h2>8. Vos droits</h2>
      <p>Accès, rectification, suppression, opposition — écrivez à contactazamed98@gmail.com. Les médecins et délégués médicaux peuvent modifier eux-mêmes une partie de leur profil directement depuis l'application.</p>

      <h2>9. Mineurs</h2>
      <p>AZAMED n'est pas destiné aux moins de 18 ans. Si un compte a été créé par un mineur, contactez-nous pour sa suppression.</p>

      <h2>10. Modifications</h2>
      <p>Cette politique peut évoluer. La date de mise à jour figure en haut de cette page. Tout changement important vous sera signalé dans l'application.</p>

      <h2>11. Nous contacter</h2>
      <p>📧 <strong>contactazamed98@gmail.com</strong></p>
    </div>
  );
}
