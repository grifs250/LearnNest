export const LESSON_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

export const LESSON_LENGTH_OPTIONS = [30, 45, 60, 90, 120] as const;

export const DEFAULT_LESSON_LENGTH = 45;

export const LESSON_TYPES = {
  INDIVIDUAL: 'individual',
  GROUP: 'group'
} as const;

export const CATEGORY_NAMES = {
  'languages': 'Valodas',
  'sciences': 'Zinātnes',
  'arts': 'Māksla',
  'music': 'Mūzika',
  'sports': 'Sports',
  'other': 'Citi priekšmeti'
} as const; 