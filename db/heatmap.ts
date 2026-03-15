import { Database } from './interface';
import { Category, ColdSpot, SuggestedPlan, Technique } from '@/types';
import { calculateTemperatureScore, temperatureToColor } from '@/utils/temperature';
import { CATEGORIES } from '@/constants/categories';

export interface TechniqueTemperature {
  id: string;
  name: string;
  category: Category;
  last_taught: string | null;
  frequency_8wk: number;
  days_since: number | null;
}

export function getTechniqueTemperatures(
  db: Database,
  category?: Category,
  referenceDate?: string
): TechniqueTemperature[] {
  const refDateExpr = referenceDate ? `'${referenceDate}'` : "'now'";
  const eightWeeksAgo = referenceDate
    ? `date('${referenceDate}', '-56 days')`
    : "date('now', '-56 days')";

  const categoryClause = category ? 'AND t.category = ?' : '';
  const params = category ? [category] : [];

  return db.all<TechniqueTemperature>(
    `SELECT t.id, t.name, t.category,
       MAX(cl.date) as last_taught,
       COUNT(CASE WHEN cl.date >= ${eightWeeksAgo} THEN 1 END) as frequency_8wk,
       CASE WHEN MAX(cl.date) IS NOT NULL
         THEN CAST(julianday(${refDateExpr}) - julianday(MAX(cl.date)) AS INTEGER)
         ELSE NULL
       END as days_since
     FROM technique t
     LEFT JOIN class_log cl ON (t.id = cl.standing_zoom_in OR t.id = cl.guard OR t.id = cl.submission)
     WHERE t.deleted_at IS NULL ${categoryClause}
     GROUP BY t.id
     ORDER BY t.category, t.name`,
    params
  );
}

export interface WeeklyFrequency {
  technique_id: string;
  name: string;
  category: Category;
  week_start: string;
  count: number;
}

export function getWeeklyFrequency(db: Database, days: number): WeeklyFrequency[] {
  return db.all<WeeklyFrequency>(
    `SELECT t.id AS technique_id, t.name, t.category,
       date(cl.date, 'weekday 0', '-6 days') AS week_start,
       COUNT(*) AS count
     FROM class_log cl
     JOIN technique t ON (t.id = cl.standing_zoom_in OR t.id = cl.guard OR t.id = cl.submission)
     WHERE cl.date >= date('now', '-' || ? || ' days')
       AND t.deleted_at IS NULL
     GROUP BY t.id, week_start
     ORDER BY t.category, t.name, week_start`,
    [days]
  );
}

export function getColdSpots(db: Database, referenceDate?: string): ColdSpot[] {
  const refDateExpr = referenceDate ? `'${referenceDate}'` : "'now'";
  const eightWeeksAgo = referenceDate
    ? `date('${referenceDate}', '-56 days')`
    : "date('now', '-56 days')";

  const rows = db.all<{
    id: string;
    name: string;
    category: Category;
    last_taught: string | null;
    total_count: number;
    days_since: number | null;
    frequency_8wk: number;
  }>(
    `SELECT t.id, t.name, t.category,
       MAX(cl.date) as last_taught,
       COUNT(cl.id) as total_count,
       CASE WHEN MAX(cl.date) IS NOT NULL
         THEN CAST(julianday(${refDateExpr}) - julianday(MAX(cl.date)) AS INTEGER)
         ELSE NULL
       END as days_since,
       COUNT(CASE WHEN cl.date >= ${eightWeeksAgo} THEN 1 END) as frequency_8wk
     FROM technique t
     LEFT JOIN class_log cl ON (t.id = cl.standing_zoom_in OR t.id = cl.guard OR t.id = cl.submission)
     WHERE t.deleted_at IS NULL
     GROUP BY t.id
     ORDER BY last_taught ASC NULLS FIRST, total_count ASC`
  );

  return rows.map((row) => {
    const score = calculateTemperatureScore(row.frequency_8wk, row.days_since, row.category);
    return {
      ...row,
      temperature_score: score,
      temperature_color: temperatureToColor(score),
    };
  });
}

export function getSuggestedPlan(db: Database, referenceDate?: string): SuggestedPlan | null {
  const coldSpots = getColdSpots(db, referenceDate);

  const findColdest = (cat: Category): Technique | undefined => {
    const spot = coldSpots.find((s) => s.category === cat);
    if (!spot) return undefined;
    return { id: spot.id, name: spot.name, category: spot.category, created_at: '', deleted_at: null };
  };

  const standing = findColdest('standing_zoom_in');
  const guard = findColdest('guard');
  const submission = findColdest('submission');

  if (!standing || !guard || !submission) return null;

  return { standing_zoom_in: standing, guard, submission };
}
