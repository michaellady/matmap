import { Category } from '@/types';

export interface SeedTechnique {
  name: string;
  category: Category;
}

export const SEED_TECHNIQUES: SeedTechnique[] = [
  // Standing Zoom-In (10)
  { name: 'Front headlock → backtake vs. drag / peek out / stand up', category: 'standing_zoom_in' },
  { name: 'Front headlock → finish submission', category: 'standing_zoom_in' },
  { name: 'Front headlock → double over, chest wrap', category: 'standing_zoom_in' },
  { name: 'Back body lock → mat return', category: 'standing_zoom_in' },
  { name: 'Front body lock → bear hug or drop to single vs. guard pull', category: 'standing_zoom_in' },
  { name: 'Single leg → finish vs. get leg back', category: 'standing_zoom_in' },
  { name: 'Underhook → uchi mata', category: 'standing_zoom_in' },
  { name: 'Underhook → head and arm throw', category: 'standing_zoom_in' },
  { name: 'Over-under → lateral drop', category: 'standing_zoom_in' },
  { name: 'Underhook → duck under', category: 'standing_zoom_in' },
  // Guard (6)
  { name: 'Half guard', category: 'guard' },
  { name: 'Butterfly guard', category: 'guard' },
  { name: 'X-guard', category: 'guard' },
  { name: 'Open guard', category: 'guard' },
  { name: 'Closed guard', category: 'guard' },
  { name: 'Ashi garami / leg entanglements', category: 'guard' },
  // Submission (6)
  { name: 'RNC', category: 'submission' },
  { name: 'Front headlocks', category: 'submission' },
  { name: 'Triangles', category: 'submission' },
  { name: 'Kimura / Americana', category: 'submission' },
  { name: 'Armbars', category: 'submission' },
  { name: 'Leglocks', category: 'submission' },
];
