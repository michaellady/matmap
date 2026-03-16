import { Category } from '@/types';

export const CATEGORY_LABELS: Record<Category, string> = {
  standing: 'Standing',
  guard: 'Guard vs. Passing',
  pinning: 'Pinning',
  submission: 'Submissions',
};

export const CATEGORIES: Category[] = ['standing', 'guard', 'pinning', 'submission'];

export const CATEGORY_COUNTS: Record<Category, number> = {
  standing: 10,
  guard: 6,
  pinning: 0,
  submission: 6,
};
