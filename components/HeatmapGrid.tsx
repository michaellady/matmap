import React, { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { DARK_THEME } from '@/constants/colors';
import { HeatmapCellData, Category } from '@/types';
import { CATEGORIES, CATEGORY_LABELS } from '@/constants/categories';
import { HeatmapCell } from './HeatmapCell';
import { formatShortDate } from '@/utils/dates';

interface Props {
  grid: HeatmapCellData[];
  weekStarts: string[];
}

export function HeatmapGrid({ grid, weekStarts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');

  const filteredCategories: Category[] =
    selectedCategory === 'all' ? CATEGORIES : [selectedCategory];

  // Get unique techniques for filtered categories
  const techniques = new Map<string, { id: string; name: string; category: Category }>();
  grid.forEach((cell) => {
    if (
      filteredCategories.includes(cell.category) &&
      !techniques.has(cell.techniqueId)
    ) {
      techniques.set(cell.techniqueId, {
        id: cell.techniqueId,
        name: cell.techniqueName,
        category: cell.category,
      });
    }
  });

  const techniqueList = Array.from(techniques.values());

  // Build lookup
  const cellMap = new Map<string, HeatmapCellData>();
  grid.forEach((cell) => {
    cellMap.set(`${cell.techniqueId}-${cell.weekStart}`, cell);
  });

  return (
    <View style={styles.container}>
      {/* Category filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        <Pressable
          style={[styles.filterTab, selectedCategory === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text
            style={[
              styles.filterText,
              selectedCategory === 'all' && styles.filterTextActive,
            ]}
          >
            All
          </Text>
        </Pressable>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.filterTab, selectedCategory === cat && styles.filterTabActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text
              style={[
                styles.filterText,
                selectedCategory === cat && styles.filterTextActive,
              ]}
            >
              {CATEGORY_LABELS[cat]}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      {/* Grid */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View>
          {/* Week headers */}
          <View style={styles.headerRow}>
            <View style={styles.labelCell} />
            {weekStarts.map((ws) => (
              <View key={ws} style={styles.weekHeader}>
                <Text style={styles.weekHeaderText}>{formatShortDate(ws)}</Text>
              </View>
            ))}
          </View>

          {/* Technique rows */}
          {techniqueList.map((tech) => (
            <View key={tech.id} style={styles.row}>
              <View style={styles.labelCell}>
                <Text style={styles.labelText} numberOfLines={1}>
                  {tech.name}
                </Text>
              </View>
              {weekStarts.map((ws) => {
                const cell = cellMap.get(`${tech.id}-${ws}`);
                return (
                  <HeatmapCell
                    key={ws}
                    color={cell?.color ?? DARK_THEME.surfaceLight}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  filterBar: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingHorizontal: 16,
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: DARK_THEME.surface,
  },
  filterTabActive: {
    backgroundColor: DARK_THEME.accent,
  },
  filterText: {
    fontSize: 13,
    color: DARK_THEME.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  weekHeader: {
    width: 32,
    alignItems: 'center',
  },
  weekHeaderText: {
    fontSize: 10,
    color: DARK_THEME.textMuted,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  labelCell: {
    width: 140,
    paddingRight: 8,
  },
  labelText: {
    fontSize: 11,
    color: DARK_THEME.textSecondary,
  },
});
