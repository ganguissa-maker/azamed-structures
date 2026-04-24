// src/utils/structureThemes.js — Thèmes par type de structure

export const STRUCTURE_THEMES = {
  PHARMACIE: {
    label:       'Pharmacie',
    couleur:     '#2d6a4f',   // vert militaire
    couleurClair:'#d8f3dc',
    couleurMed:  '#52b788',
    gradient:    'from-[#1b4332] to-[#2d6a4f]',
    icone:       '💊',
    description: 'Officine pharmaceutique agréée',
  },
  LABORATOIRE: {
    label:       'Laboratoire d\'analyses',
    couleur:     '#7b2d42',   // bordeaux
    couleurClair:'#fce4ec',
    couleurMed:  '#c2185b',
    gradient:    'from-[#560927] to-[#7b2d42]',
    icone:       '🔬',
    description: 'Laboratoire d\'analyses médicales',
  },
  CENTRE_IMAGERIE: {
    label:       'Centre d\'imagerie',
    couleur:     '#1a237e',   // bleu marine
    couleurClair:'#e8eaf6',
    couleurMed:  '#3949ab',
    gradient:    'from-[#0d1257] to-[#1a237e]',
    icone:       '🩻',
    description: 'Centre d\'imagerie médicale (Radio, Scanner, IRM)',
  },
  LABO_ET_IMAGERIE: {
    label:       'Labo & Centre d\'imagerie',
    couleur:     '#4a148c',   // violet
    couleurClair:'#f3e5f5',
    couleurMed:  '#7b1fa2',
    gradient:    'from-[#2d0057] to-[#4a148c]',
    icone:       '🏥',
    description: 'Laboratoire et imagerie médicale combinés',
  },
  HOPITAL_PUBLIC: {
    label:       'Hôpital Public',
    couleur:     '#1565c0',   // bleu
    couleurClair:'#e3f2fd',
    couleurMed:  '#1976d2',
    gradient:    'from-[#0a3880] to-[#1565c0]',
    icone:       '🏨',
    description: 'Établissement public hospitalier',
  },
  POLYCLINIQUE: {
    label:       'Polyclinique',
    couleur:     '#00695c',   // teal
    couleurClair:'#e0f2f1',
    couleurMed:  '#00897b',
    gradient:    'from-[#003d33] to-[#00695c]',
    icone:       '🏩',
    description: 'Polyclinique privée',
  },
  CLINIQUE: {
    label:       'Clinique',
    couleur:     '#6a1b9a',   // violet foncé
    couleurClair:'#f3e5f5',
    couleurMed:  '#8e24aa',
    gradient:    'from-[#38006b] to-[#6a1b9a]',
    icone:       '🏥',
    description: 'Clinique médicale privée',
  },
  CABINET_MEDICAL: {
    label:       'Cabinet Médical',
    couleur:     '#e65100',   // orange foncé
    couleurClair:'#fff3e0',
    couleurMed:  '#f57c00',
    gradient:    'from-[#bf360c] to-[#e65100]',
    icone:       '👨‍⚕️',
    description: 'Cabinet médical ou de spécialité',
  },
  CABINET_SPECIALISE: {
    label:       'Cabinet Spécialisé',
    couleur:     '#37474f',   // gris bleu
    couleurClair:'#eceff1',
    couleurMed:  '#546e7a',
    gradient:    'from-[#1c313a] to-[#37474f]',
    icone:       '🩺',
    description: 'Cabinet médical spécialisé',
  },
  CENTRE_SANTE: {
    label:       'Centre de Santé',
    couleur:     '#558b2f',   // vert
    couleurClair:'#f1f8e9',
    couleurMed:  '#689f38',
    gradient:    'from-[#33691e] to-[#558b2f]',
    icone:       '🏪',
    description: 'Centre de santé communautaire',
  },
};

export const TYPES_LISTE = Object.entries(STRUCTURE_THEMES).map(([value, t]) => ({
  value,
  label:       t.label,
  icone:       t.icone,
  description: t.description,
}));

// Champs spécifiques par type de structure
export const CHAMPS_SPECIFIQUES = {
  PHARMACIE: [
    { name:'numAutorisationPharm', label:'N° Autorisation pharmacie', placeholder:'Ex: MINSAN-2024-001', required: true },
    { name:'nomPharmacien',         label:'Nom du pharmacien titulaire', placeholder:'Dr. Jean Dupont', required: true },
    { name:'ordrePharmaciens',      label:'N° Ordre des pharmaciens', placeholder:'Ex: OPH-CM-2024-xxx', required: false },
  ],
  LABORATOIRE: [
    { name:'numAgrement',           label:'N° Agrément laboratoire', placeholder:'Ex: MINSAN-LABO-2024', required: true },
    { name:'nomBiologiste',         label:'Biologiste responsable', placeholder:'Dr. Marie Martin', required: true },
    { name:'categoriesExamens',     label:'Catégories d\'examens principales', placeholder:'Ex: Hématologie, Biochimie, Sérologie', required: false },
  ],
  CENTRE_IMAGERIE: [
    { name:'numAgrement',           label:'N° Agrément centre imagerie', placeholder:'Ex: MINSAN-IMG-2024', required: true },
    { name:'nomMedecinRadiologue',  label:'Médecin radiologue responsable', placeholder:'Dr. Alain Nkomo', required: true },
    { name:'equipementsImagerie',   label:'Équipements disponibles', placeholder:'Ex: Radio, Scanner, IRM, Échographie', required: false },
  ],
  LABO_ET_IMAGERIE: [
    { name:'numAgrement',           label:'N° Agrément', placeholder:'Ex: MINSAN-2024', required: true },
    { name:'nomResponsable',        label:'Responsable médical', placeholder:'Dr. Prénom Nom', required: true },
    { name:'servicesDisponibles',   label:'Services disponibles', placeholder:'Ex: Biochimie, Radio, Échographie', required: false },
  ],
  HOPITAL_PUBLIC: [
    { name:'numMinistere',          label:'N° Ministère de la santé', placeholder:'Ex: MINSAN-HOP-2024', required: true },
    { name:'niveauSoin',            label:'Niveau de soins', placeholder:'Ex: Hôpital de district, CHU, CHR', required: true },
    { name:'nombreLits',            label:'Nombre de lits', placeholder:'Ex: 150', required: false },
    { name:'departements',          label:'Départements / Spécialités', placeholder:'Ex: Médecine, Chirurgie, Maternité', required: false },
  ],
  POLYCLINIQUE: [
    { name:'numAutorisationOuverture', label:'N° Autorisation d\'ouverture', placeholder:'Ex: MINSAN-POLY-2024', required: true },
    { name:'nomMedecinDirecteur',   label:'Médecin directeur', placeholder:'Dr. Prénom Nom', required: true },
    { name:'nombreLits',            label:'Nombre de lits', placeholder:'Ex: 50', required: false },
    { name:'specialites',           label:'Spécialités principales', placeholder:'Ex: Cardiologie, Pédiatrie, Chirurgie', required: false },
  ],
  CLINIQUE: [
    { name:'numAutorisationOuverture', label:'N° Autorisation d\'ouverture', placeholder:'Ex: MINSAN-CLI-2024', required: true },
    { name:'nomMedecinDirecteur',   label:'Médecin directeur', placeholder:'Dr. Prénom Nom', required: true },
    { name:'specialites',           label:'Spécialités', placeholder:'Ex: Obstétrique, Pédiatrie', required: false },
  ],
  CABINET_MEDICAL: [
    { name:'numOrdre',              label:'N° Ordre des médecins', placeholder:'Ex: ONC-CM-2024-xxx', required: true },
    { name:'nomMedecin',            label:'Médecin titulaire', placeholder:'Dr. Prénom Nom', required: true },
    { name:'specialitePrincipale',  label:'Spécialité principale', placeholder:'Ex: Médecine Générale, Pédiatrie', required: false },
  ],
  CABINET_SPECIALISE: [
    { name:'numOrdre',              label:'N° Ordre des médecins', placeholder:'Ex: ONC-CM-2024-xxx', required: true },
    { name:'nomMedecin',            label:'Médecin spécialiste', placeholder:'Dr. Prénom Nom', required: true },
    { name:'specialitePrincipale',  label:'Spécialité', placeholder:'Ex: Cardiologie, ORL, Ophtalmologie', required: true },
  ],
  CENTRE_SANTE: [
    { name:'numAgrement',           label:'N° Agrément centre de santé', placeholder:'Ex: MINSAN-CS-2024', required: false },
    { name:'nomResponsable',        label:'Responsable du centre', placeholder:'Prénom Nom', required: true },
    { name:'zonesServices',         label:'Zone de couverture', placeholder:'Ex: Quartiers desservis', required: false },
  ],
};

export const HEURES = [
  '06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30','10:00',
  '10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00','14:30',
  '15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30','19:00',
  '19:30','20:00','20:30','21:00','22:00','23:00','00:00',
];
