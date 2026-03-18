export type Category = 'standing' | 'guard' | 'pinning' | 'submission';

export interface Technique {
  id: string;
  name: string;
  category: Category;
  created_at: string;
  deleted_at: string | null;
}

export interface ClassLog {
  id: string;
  date: string;
  week_theme: string;
  standing: string;
  guard: string;
  pinning: string | null;
  submission: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface TechniqueWithTemperature extends Technique {
  last_taught: string | null;
  frequency_8wk: number;
  temperature_score: number;
  temperature_color: string;
}

export interface HeatmapCellData {
  techniqueId: string;
  techniqueName: string;
  category: Category;
  weekStart: string;
  count: number;
  color: string;
}

export interface ColdSpot {
  id: string;
  name: string;
  category: Category;
  last_taught: string | null;
  total_count: number;
  days_since: number | null;
  temperature_score: number;
  temperature_color: string;
}

export interface SuggestedPlan {
  standing: Technique;
  guard: Technique;
  pinning: Technique | null;
  submission: Technique;
}

export interface ClassLogWithTechniques extends ClassLog {
  standing_name: string;
  guard_name: string;
  pinning_name: string | null;
  submission_name: string;
}
