import { Category } from '@/types';

export interface SeedTechnique {
  name: string;
  category: Category;
}

export const SEED_TECHNIQUES: SeedTechnique[] = [
  // Standing (10)
  { name: 'Front headlock → backtake vs. drag / peek out / stand up', category: 'standing' },
  { name: 'Front headlock → finish submission', category: 'standing' },
  { name: 'Front headlock → double over, chest wrap', category: 'standing' },
  { name: 'Back body lock → mat return', category: 'standing' },
  { name: 'Front body lock → bear hug or drop to single vs. guard pull', category: 'standing' },
  { name: 'Single leg → finish vs. get leg back', category: 'standing' },
  { name: 'Underhook → uchi mata', category: 'standing' },
  { name: 'Underhook → head and arm throw', category: 'standing' },
  { name: 'Over-under → lateral drop', category: 'standing' },
  { name: 'Underhook → duck under', category: 'standing' },
  // Guard vs. Passing (6)
  { name: 'Half guard', category: 'guard' },
  { name: 'Butterfly guard', category: 'guard' },
  { name: 'X-guard', category: 'guard' },
  { name: 'Open guard', category: 'guard' },
  { name: 'Closed guard', category: 'guard' },
  { name: 'Ashi garami / leg entanglements', category: 'guard' },
  // Pinning (3)
  { name: 'Mount escapes', category: 'pinning' },
  { name: 'Side control escapes', category: 'pinning' },
  { name: 'North south escapes', category: 'pinning' },
  // Submissions (6)
  { name: 'RNC', category: 'submission' },
  { name: 'Front headlocks', category: 'submission' },
  { name: 'Triangles', category: 'submission' },
  { name: 'Kimura / Americana', category: 'submission' },
  { name: 'Armbars', category: 'submission' },
  { name: 'Leglocks', category: 'submission' },
];
