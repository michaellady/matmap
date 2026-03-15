import { useCallback, useEffect, useState } from 'react';
import { ColdSpot, HeatmapCellData, SuggestedPlan, Category } from '@/types';
import { useDatabase } from './useDatabase';
import { getWeeklyFrequency, getColdSpots, getSuggestedPlan } from '@/db/heatmap';
import { getAllTechniques } from '@/db/techniques';
import { getWeekStarts } from '@/utils/dates';
import { calculateTemperatureScore, temperatureToColor } from '@/utils/temperature';

export function useHeatmapData(numWeeks: number = 8) {
  const { db, dataVersion } = useDatabase();
  const [grid, setGrid] = useState<HeatmapCellData[]>([]);
  const [coldSpots, setColdSpots] = useState<ColdSpot[]>([]);
  const [suggestedPlan, setSuggestedPlan] = useState<SuggestedPlan | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!db) return;
    setLoading(true);

    const days = numWeeks * 7;
    const weekFreq = getWeeklyFrequency(db, days);
    const techniques = getAllTechniques(db);
    const weeks = getWeekStarts(numWeeks);

    // Build frequency lookup
    const freqMap = new Map<string, number>();
    weekFreq.forEach((f) => {
      freqMap.set(`${f.technique_id}-${f.week_start}`, f.count);
    });

    // Build full grid
    const gridData: HeatmapCellData[] = [];
    techniques.forEach((t) => {
      weeks.forEach((weekStart) => {
        const count = freqMap.get(`${t.id}-${weekStart}`) ?? 0;
        // Simple color: use count as proxy
        const score = count > 0 ? Math.min(count * 3, 10) : 0;
        gridData.push({
          techniqueId: t.id,
          techniqueName: t.name,
          category: t.category,
          weekStart,
          count,
          color: temperatureToColor(score),
        });
      });
    });

    setGrid(gridData);
    setColdSpots(getColdSpots(db));
    setSuggestedPlan(getSuggestedPlan(db));
    setLoading(false);
  }, [db, numWeeks, dataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { grid, coldSpots, suggestedPlan, loading, refresh };
}
