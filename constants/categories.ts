import { Category } from '@/types';

export const CATEGORY_LABELS: Record<Category, string> = {
  standing_zoom_in: 'Standing Zoom-In',
  guard: 'Guard',
  submission: 'Submission',
};

export const CATEGORIES: Category[] = ['standing_zoom_in', 'guard', 'submission'];

export const CATEGORY_COUNTS: Record<Category, number> = {
  standing_zoom_in: 10,
  guard: 6,
  submission: 6,
};
