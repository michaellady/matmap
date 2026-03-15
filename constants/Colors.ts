export const HEATMAP_COLORS = {
  gray: '#6B7280',
  blue: '#3B82F6',
  orange: '#F59E0B',
  red: '#EF4444',
} as const;

export const HEATMAP_STOPS = [
  { score: 0, color: HEATMAP_COLORS.gray },
  { score: 3, color: HEATMAP_COLORS.blue },
  { score: 6, color: HEATMAP_COLORS.orange },
  { score: 10, color: HEATMAP_COLORS.red },
] as const;

export const DARK_THEME = {
  background: '#111827',
  surface: '#1F2937',
  surfaceLight: '#374151',
  text: '#F9FAFB',
  textSecondary: '#9CA3AF',
  textMuted: '#6B7280',
  border: '#374151',
  accent: '#3B82F6',
  danger: '#EF4444',
  success: '#10B981',
} as const;
