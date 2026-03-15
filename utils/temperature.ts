import { Category } from '@/types';
import { HEATMAP_STOPS } from '@/constants/colors';
import { CATEGORY_COUNTS } from '@/constants/categories';

const CLASSES_IN_8_WEEKS = 16;

export function calculateTemperatureScore(
  frequency8wk: number,
  daysSinceLastTaught: number | null,
  category: Category
): number {
  const expectedFreq = CLASSES_IN_8_WEEKS / CATEGORY_COUNTS[category];
  const frequencyRatio = Math.min(frequency8wk / expectedFreq, 2);

  let recencyScore: number;
  if (daysSinceLastTaught === null) {
    recencyScore = 0;
  } else {
    recencyScore = Math.max(0, 10 - daysSinceLastTaught / 3);
  }

  const score = frequencyRatio * 3 + recencyScore * 0.7;
  return Math.min(Math.max(score, 0), 10);
}

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map((c) => Math.round(c).toString(16).padStart(2, '0')).join('').toUpperCase();
}

export function temperatureToColor(score: number): string {
  const stops = HEATMAP_STOPS;

  if (score <= stops[0].score) return stops[0].color;
  if (score >= stops[stops.length - 1].score) return stops[stops.length - 1].color;

  for (let i = 0; i < stops.length - 1; i++) {
    if (score >= stops[i].score && score <= stops[i + 1].score) {
      const t = (score - stops[i].score) / (stops[i + 1].score - stops[i].score);
      const [r1, g1, b1] = hexToRgb(stops[i].color);
      const [r2, g2, b2] = hexToRgb(stops[i + 1].color);
      return rgbToHex(
        r1 + (r2 - r1) * t,
        g1 + (g2 - g1) * t,
        b1 + (b2 - b1) * t
      );
    }
  }

  return stops[stops.length - 1].color;
}
