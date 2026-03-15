import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME } from '@/constants/colors';
import { ColdSpot } from '@/types';
import { CATEGORY_LABELS } from '@/constants/categories';
import { TemperatureBadge } from './TemperatureBadge';

interface Props {
  coldSpots: ColdSpot[];
  limit?: number;
}

export function ColdSpotsList({ coldSpots, limit = 10 }: Props) {
  const top = coldSpots.slice(0, limit);

  if (top.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No techniques yet. Add some to get started!</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Coldest Techniques</Text>
      {top.map((spot, i) => (
        <View key={spot.id} style={styles.item}>
          <View style={styles.rank}>
            <Text style={styles.rankText}>{i + 1}</Text>
          </View>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {spot.name}
            </Text>
            <View style={styles.meta}>
              <Text style={styles.category}>{CATEGORY_LABELS[spot.category]}</Text>
              <TemperatureBadge
                color={spot.temperature_color}
                frequency={spot.total_count}
                daysSince={spot.days_since}
              />
            </View>
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_THEME.text,
    marginBottom: 12,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.border,
  },
  rank: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: DARK_THEME.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  rankText: {
    fontSize: 13,
    fontWeight: '700',
    color: DARK_THEME.textSecondary,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 15,
    color: DARK_THEME.text,
    fontWeight: '500',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  category: {
    fontSize: 12,
    color: DARK_THEME.textMuted,
  },
  empty: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: DARK_THEME.textMuted,
  },
});
