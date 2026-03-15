import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DARK_THEME } from '@/constants/colors';

interface Props {
  color: string;
  frequency: number;
  daysSince: number | null;
}

export function TemperatureBadge({ color, frequency, daysSince }: Props) {
  const daysText =
    daysSince === null ? 'never' : daysSince === 0 ? 'today' : `${daysSince}d ago`;

  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color }]} />
      <Text style={styles.text}>
        {frequency}x in 8wk · {daysText}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  text: {
    fontSize: 12,
    color: DARK_THEME.textSecondary,
  },
});
