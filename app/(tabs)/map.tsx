import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { DARK_THEME } from '@/constants/colors';
import { useHeatmapData } from '@/hooks/useHeatmapData';
import { HeatmapGrid } from '@/components/HeatmapGrid';
import { ColdSpotsList } from '@/components/ColdSpotsList';
import { AutoSuggestCard } from '@/components/AutoSuggestCard';
import { getWeekStarts } from '@/utils/dates';
import { SuggestedPlan } from '@/types';

const WEEK_OPTIONS = [
  { label: '4 wk', weeks: 4 },
  { label: '8 wk', weeks: 8 },
  { label: '12 wk', weeks: 12 },
] as const;

export default function MapScreen() {
  const [numWeeks, setNumWeeks] = useState(8);
  const { grid, coldSpots, suggestedPlan, loading } = useHeatmapData(numWeeks);
  const weekStarts = getWeekStarts(numWeeks);

  const handleUsePlan = (plan: SuggestedPlan) => {
    router.navigate({
      pathname: '/(tabs)',
      params: {
        standing_zoom_in: plan.standing_zoom_in.id,
        guard: plan.guard.id,
        submission: plan.submission.id,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={DARK_THEME.accent} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      {/* Time filter */}
      <View style={styles.filterRow}>
        {WEEK_OPTIONS.map((opt) => (
          <Pressable
            key={opt.weeks}
            style={[
              styles.filterButton,
              numWeeks === opt.weeks && styles.filterButtonActive,
            ]}
            onPress={() => setNumWeeks(opt.weeks)}
          >
            <Text
              style={[
                styles.filterButtonText,
                numWeeks === opt.weeks && styles.filterButtonTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      {/* Heatmap Grid */}
      <HeatmapGrid grid={grid} weekStarts={weekStarts} />

      {/* Auto-Suggest */}
      {suggestedPlan && (
        <AutoSuggestCard plan={suggestedPlan} onUsePlan={handleUsePlan} />
      )}

      {/* Cold Spots */}
      <ColdSpotsList coldSpots={coldSpots} />

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
  },
  loading: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterRow: {
    flexDirection: 'row',
    padding: 16,
    gap: 8,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    minHeight: 44,
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: DARK_THEME.surface,
  },
  filterButtonActive: {
    backgroundColor: DARK_THEME.accent,
  },
  filterButtonText: {
    fontSize: 14,
    color: DARK_THEME.textSecondary,
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
