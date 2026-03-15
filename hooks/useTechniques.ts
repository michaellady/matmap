import { useCallback, useEffect, useState } from 'react';
import { Category, TechniqueWithTemperature } from '@/types';
import { useDatabase } from './useDatabase';
import { getTechniqueTemperatures } from '@/db/heatmap';
import { calculateTemperatureScore, temperatureToColor } from '@/utils/temperature';

export function useTechniques(category?: Category) {
  const { db, dataVersion } = useDatabase();
  const [techniques, setTechniques] = useState<TechniqueWithTemperature[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!db) return;
    setLoading(true);
    const temps = getTechniqueTemperatures(db, category);
    const withTemp: TechniqueWithTemperature[] = temps.map((t) => {
      const score = calculateTemperatureScore(t.frequency_8wk, t.days_since, t.category);
      return {
        id: t.id,
        name: t.name,
        category: t.category,
        created_at: '',
        deleted_at: null,
        last_taught: t.last_taught,
        frequency_8wk: t.frequency_8wk,
        temperature_score: score,
        temperature_color: temperatureToColor(score),
      };
    });
    setTechniques(withTemp);
    setLoading(false);
  }, [db, category, dataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { techniques, loading, refresh };
}
