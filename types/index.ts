export type Category = 'standing_zoom_in' | 'guard' | 'submission';

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
  standing_zoom_in: string;
  guard: string;
  submission: string;
  guard_zoom_in_notes: string;
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
  standing_zoom_in: Technique;
  guard: Technique;
  submission: Technique;
}

export interface ClassLogWithTechniques extends ClassLog {
  standing_zoom_in_name: string;
  guard_name: string;
  submission_name: string;
}
