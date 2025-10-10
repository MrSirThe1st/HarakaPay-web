// Congolese Education System Grade Structure
// Based on the DRC education reform

export interface CongoleseGrade {
  value: string;
  label: string;
  level: string;
  order: number;
  description?: string;
}

export const CONGOLESE_GRADES: CongoleseGrade[] = [
  // Maternelle (Preschool / Kindergarten)
  { value: 'maternelle-1', label: '1ʳᵉ Maternelle', level: 'Maternelle', order: 1, description: 'Première année de maternelle' },
  { value: 'maternelle-2', label: '2ᵉ Maternelle', level: 'Maternelle', order: 2, description: 'Deuxième année de maternelle' },
  { value: 'maternelle-3', label: '3ᵉ Maternelle', level: 'Maternelle', order: 3, description: 'Troisième année de maternelle' },

  // École Primaire (Primary)
  { value: 'primaire-1', label: '1ʳᵉ Primaire', level: 'Primaire', order: 4, description: 'Première année primaire' },
  { value: 'primaire-2', label: '2ᵉ Primaire', level: 'Primaire', order: 5, description: 'Deuxième année primaire' },
  { value: 'primaire-3', label: '3ᵉ Primaire', level: 'Primaire', order: 6, description: 'Troisième année primaire' },
  { value: 'primaire-4', label: '4ᵉ Primaire', level: 'Primaire', order: 7, description: 'Quatrième année primaire' },
  { value: 'primaire-5', label: '5ᵉ Primaire', level: 'Primaire', order: 8, description: 'Cinquième année primaire' },
  { value: 'primaire-6', label: '6ᵉ Primaire', level: 'Primaire', order: 9, description: 'Sixième année primaire' },

  // Éducation de Base
  { value: 'base-7', label: '7ᵉ année de l\'Éducation de Base', level: 'Éducation de Base', order: 10, description: 'Anciennement 1ʳᵉ Secondaire' },
  { value: 'base-8', label: '8ᵉ année de l\'Éducation de Base', level: 'Éducation de Base', order: 11, description: 'Anciennement 2ᵉ Secondaire' },

  // Humanités (Upper secondary, 4 years)
  { value: 'humanites-1', label: '1ʳᵉ année des Humanités', level: 'Humanités', order: 12, description: 'Anciennement 3ᵉ Secondaire' },
  { value: 'humanites-2', label: '2ᵉ année des Humanités', level: 'Humanités', order: 13, description: 'Anciennement 4ᵉ Secondaire' },
  { value: 'humanites-3', label: '3ᵉ année des Humanités', level: 'Humanités', order: 14, description: 'Anciennement 5ᵉ Secondaire' },
  { value: 'humanites-4', label: '4ᵉ année des Humanités', level: 'Humanités', order: 15, description: 'Anciennement 6ᵉ Secondaire / Terminale' },

  // Enseignement supérieur — Université (LMD)
  { value: 'licence-1', label: 'Licence 1 (L1)', level: 'Université', order: 16, description: 'Première année de licence' },
  { value: 'licence-2', label: 'Licence 2 (L2)', level: 'Université', order: 17, description: 'Deuxième année de licence' },
  { value: 'licence-3', label: 'Licence 3 (L3)', level: 'Université', order: 18, description: 'Troisième année de licence' },
  { value: 'master-1', label: 'Master 1 (M1)', level: 'Université', order: 19, description: 'Première année de master' },
  { value: 'master-2', label: 'Master 2 (M2)', level: 'Université', order: 20, description: 'Deuxième année de master' },
  { value: 'doctorat', label: 'Doctorat', level: 'Université', order: 21, description: 'Doctorat année 1 → Doctorat année N' },
];

// Helper functions
export function getGradeByValue(value: string): CongoleseGrade | undefined {
  return CONGOLESE_GRADES.find(grade => grade.value === value);
}

export function getGradesByLevel(level: string): CongoleseGrade[] {
  return CONGOLESE_GRADES.filter(grade => grade.level === level);
}

export function getAllLevels(): string[] {
  return [...new Set(CONGOLESE_GRADES.map(grade => grade.level))];
}

export function getGradeOptions() {
  return CONGOLESE_GRADES.map(grade => ({
    value: grade.value,
    label: grade.label,
    description: grade.description
  }));
}

// Program types based on Congolese system
export const CONGOLESE_PROGRAM_TYPES = [
  { value: 'maternelle', label: 'Maternelle' },
  { value: 'primaire', label: 'École Primaire' },
  { value: 'base', label: 'Éducation de Base' },
  { value: 'humanites', label: 'Humanités' },
  { value: 'universite', label: 'Université' }
];

// Legacy grade mapping for backward compatibility
export const LEGACY_GRADE_MAPPING: Record<string, string> = {
  'pre-k': 'maternelle-1',
  'kindergarten': 'maternelle-3',
  'grade-1': 'primaire-1',
  'grade-2': 'primaire-2',
  'grade-3': 'primaire-3',
  'grade-4': 'primaire-4',
  'grade-5': 'primaire-5',
  'grade-6': 'primaire-6',
  'grade-7': 'base-7',
  'grade-8': 'base-8',
  'grade-9': 'humanites-1',
  'grade-10': 'humanites-2',
  'grade-11': 'humanites-3',
  'grade-12': 'humanites-4',
};
