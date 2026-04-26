// src/utils/structureThemes.js

export const STRUCTURE_THEMES = {
  PHARMACIE:         { label:'Pharmacie',                    couleur:'#2d6a4f', couleurClair:'#d8f3dc', couleurMed:'#52b788', gradient:'from-[#1b4332] to-[#2d6a4f]', icone:'💊', description:'Officine pharmaceutique agréée' },
  LABORATOIRE:       { label:'Laboratoire d\'analyses',      couleur:'#7b2d42', couleurClair:'#fce4ec', couleurMed:'#c2185b', gradient:'from-[#560927] to-[#7b2d42]', icone:'🔬', description:'Laboratoire d\'analyses médicales' },
  CENTRE_IMAGERIE:   { label:'Centre d\'imagerie',           couleur:'#1a237e', couleurClair:'#e8eaf6', couleurMed:'#3949ab', gradient:'from-[#0d1257] to-[#1a237e]', icone:'🩻', description:'Imagerie médicale (Radio, Scanner, IRM)' },
  LABO_ET_IMAGERIE:  { label:'Labo & Centre d\'imagerie',    couleur:'#4a148c', couleurClair:'#f3e5f5', couleurMed:'#7b1fa2', gradient:'from-[#2d0057] to-[#4a148c]', icone:'🏥', description:'Laboratoire et imagerie médicale combinés' },
  HOPITAL_PUBLIC:    { label:'Hôpital Public / Parapublic',  couleur:'#1565c0', couleurClair:'#e3f2fd', couleurMed:'#1976d2', gradient:'from-[#0a3880] to-[#1565c0]', icone:'🏨', description:'Établissement public ou parapublic hospitalier' },
  POLYCLINIQUE:      { label:'Polyclinique',                 couleur:'#00695c', couleurClair:'#e0f2f1', couleurMed:'#00897b', gradient:'from-[#003d33] to-[#00695c]', icone:'🏩', description:'Polyclinique privée' },
  CLINIQUE:          { label:'Clinique',                     couleur:'#6a1b9a', couleurClair:'#f3e5f5', couleurMed:'#8e24aa', gradient:'from-[#38006b] to-[#6a1b9a]', icone:'🏥', description:'Clinique médicale privée' },
  CABINET_MEDICAL:   { label:'Cabinet Médical',              couleur:'#e65100', couleurClair:'#fff3e0', couleurMed:'#f57c00', gradient:'from-[#bf360c] to-[#e65100]', icone:'👨‍⚕️', description:'Cabinet médical ou de spécialité' },
  CABINET_SPECIALISE:{ label:'Cabinet Spécialisé',           couleur:'#37474f', couleurClair:'#eceff1', couleurMed:'#546e7a', gradient:'from-[#1c313a] to-[#37474f]', icone:'🩺', description:'Cabinet médical spécialisé' },
  CENTRE_SANTE:      { label:'Centre de Santé',              couleur:'#558b2f', couleurClair:'#f1f8e9', couleurMed:'#689f38', gradient:'from-[#33691e] to-[#558b2f]', icone:'🏪', description:'Centre de santé communautaire' },
};

export const TYPES_LISTE = Object.entries(STRUCTURE_THEMES).map(([value, t]) => ({
  value, label: t.label, icone: t.icone, description: t.description,
}));

// ─── Champs spécifiques par type ─────────────────────────────
export const CHAMPS_SPECIFIQUES = {
  PHARMACIE: [
    { name:'numAutorisationPharm', label:'N° Autorisation pharmacie',   placeholder:'Ex: MINSAN-2024-001', required:true },
    { name:'nomPharmacien',        label:'Nom du pharmacien titulaire', placeholder:'Dr. Jean Dupont',     required:true },
  ],
  LABORATOIRE: [
    { name:'numAgrement',   label:'N° Agrément laboratoire', placeholder:'Ex: MINSAN-LABO-2024', required:true },
    { name:'nomBiologiste', label:'Biologiste responsable',  placeholder:'Dr. Marie Martin',     required:true },
  ],
  CENTRE_IMAGERIE: [
    { name:'numAgrement',          label:'N° Agrément centre imagerie',     placeholder:'Ex: MINSAN-IMG-2024', required:true },
    { name:'nomMedecinRadiologue', label:'Médecin radiologue responsable',  placeholder:'Dr. Alain Nkomo',    required:true },
  ],
  LABO_ET_IMAGERIE: [
    { name:'numAgrement',  label:'N° Agrément',     placeholder:'Ex: MINSAN-2024',     required:true },
    { name:'nomPromoteur', label:'Nom du promoteur', placeholder:'M. / Mme Prénom Nom', required:true },
  ],
  HOPITAL_PUBLIC: [
    { name:'numMinistere',    label:'N° Ministère de la santé',   placeholder:'Ex: MINSAN-HOP-2024',          required:true },
    { name:'categorieStruct', label:'Catégorie de la structure',  placeholder:'Ex: CHU, CHR, Hôpital de district', required:true },
    { name:'nomDirecteur',    label:'Nom du directeur',            placeholder:'Dr. / M. Prénom Nom',          required:true },
  ],
  POLYCLINIQUE: [
    { name:'numAutorisationOuverture', label:'N° Autorisation d\'ouverture', placeholder:'Ex: MINSAN-POLY-2024', required:true },
    { name:'nomMedecinChef',           label:'Médecin chef',                 placeholder:'Dr. Prénom Nom',       required:true },
  ],
  CLINIQUE: [
    { name:'numAutorisationOuverture', label:'N° Autorisation d\'ouverture', placeholder:'Ex: MINSAN-CLI-2024', required:true },
    { name:'nomMedecinChef',           label:'Médecin chef',                 placeholder:'Dr. Prénom Nom',       required:true },
  ],
  CABINET_MEDICAL: [
    { name:'numAutorisationOuverture', label:'N° Autorisation d\'ouverture', placeholder:'Ex: MINSAN-CAB-2024', required:true },
    { name:'nomMedecin',               label:'Médecin titulaire',            placeholder:'Dr. Prénom Nom',       required:true },
  ],
  CABINET_SPECIALISE: [
    { name:'numOrdre',   label:'N° Ordre des médecins', placeholder:'Ex: ONC-CM-2024-xxx', required:true },
    { name:'nomMedecin', label:'Médecin titulaire',      placeholder:'Dr. Prénom Nom',       required:true },
  ],
  CENTRE_SANTE: [
    { name:'numAgrement',    label:'N° Agrément centre de santé', placeholder:'Ex: MINSAN-CS-2024', required:false },
    { name:'nomResponsable', label:'Responsable du centre',        placeholder:'Prénom Nom',          required:true },
  ],
};

// ─── Modules par défaut (toujours actifs pour ce type) ───────
export const MODULES_PAR_DEFAUT = {
  PHARMACIE:         { medicaments:true,  examens:false, services:false },
  LABORATOIRE:       { medicaments:false, examens:true,  services:false },
  CENTRE_IMAGERIE:   { medicaments:false, examens:true,  services:false },
  LABO_ET_IMAGERIE:  { medicaments:false, examens:true,  services:false },
  HOPITAL_PUBLIC:    { medicaments:false, examens:false, services:true  },
  POLYCLINIQUE:      { medicaments:false, examens:false, services:true  },
  CLINIQUE:          { medicaments:false, examens:false, services:true  },
  CABINET_MEDICAL:   { medicaments:false, examens:false, services:true  },
  CABINET_SPECIALISE:{ medicaments:false, examens:false, services:true  },
  CENTRE_SANTE:      { medicaments:false, examens:false, services:true  },
};

// ─── Questions additionnelles (oui/non) par type ─────────────
// active = module qui s'active si 'oui'
export const QUESTIONS_ADDITIONNELLES = {
  PHARMACIE: [
    { key:'offresServices',     label:'Offrez-vous des services médicaux dans votre pharmacie ?',   active:'services'    },
    { key:'faitExamens',        label:'Réalisez-vous des examens biologiques et/ou d\'imagerie ?',  active:'examens'     },
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  LABORATOIRE: [
    { key:'offresServices',     label:'Offrez-vous des services médicaux ?',                        active:'services'    },
    { key:'dispenseMeds',       label:'Dispensez-vous des médicaments ?',                           active:'medicaments' },
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  CENTRE_IMAGERIE: [
    { key:'offresServices',     label:'Offrez-vous des services médicaux ?',                        active:'services'    },
    { key:'dispenseMeds',       label:'Dispensez-vous des médicaments ?',                           active:'medicaments' },
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  LABO_ET_IMAGERIE: [
    { key:'offresServices',     label:'Offrez-vous des services médicaux ?',                        active:'services'    },
    { key:'dispenseMeds',       label:'Dispensez-vous des médicaments ?',                           active:'medicaments' },
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  HOPITAL_PUBLIC: [
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  POLYCLINIQUE: [
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  CLINIQUE: [
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  CABINET_MEDICAL: [
    { key:'dispenseMeds',       label:'Dispensez-vous des médicaments ?',                           active:'medicaments' },
    { key:'faitExamens',        label:'Réalisez-vous des examens biologiques et/ou d\'imagerie ?',  active:'examens'     },
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  CABINET_SPECIALISE: [
    { key:'dispenseMeds',       label:'Dispensez-vous des médicaments ?',                           active:'medicaments' },
    { key:'faitExamens',        label:'Réalisez-vous des examens biologiques et/ou d\'imagerie ?',  active:'examens'     },
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
  CENTRE_SANTE: [
    { key:'dispenseMeds',       label:'Dispensez-vous des médicaments ?',                           active:'medicaments' },
    { key:'faitExamens',        label:'Réalisez-vous des examens biologiques et/ou d\'imagerie ?',  active:'examens'     },
    { key:'collaboreAssurance', label:'Collaborez-vous avec des assurances ?',                      active:'assurance'   },
  ],
};

export const JOURS_SEMAINE = [
  { key:'lundi',    label:'Lun' },
  { key:'mardi',    label:'Mar' },
  { key:'mercredi', label:'Mer' },
  { key:'jeudi',    label:'Jeu' },
  { key:'vendredi', label:'Ven' },
  { key:'samedi',   label:'Sam' },
  { key:'dimanche', label:'Dim' },
];

export const HEURES = [
  '00:00','06:00','06:30','07:00','07:30','08:00','08:30','09:00','09:30',
  '10:00','10:30','11:00','11:30','12:00','12:30','13:00','13:30','14:00',
  '14:30','15:00','15:30','16:00','16:30','17:00','17:30','18:00','18:30',
  '19:00','19:30','20:00','20:30','21:00','22:00','23:00',
];
