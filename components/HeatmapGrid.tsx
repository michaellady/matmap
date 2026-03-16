import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { DARK_THEME } from '@/constants/colors';
import { HeatmapCellData, Category } from '@/types';
import { CATEGORIES, CATEGORY_LABELS } from '@/constants/categories';
import { HeatmapCell } from './HeatmapCell';
import { temperatureToColor } from '@/utils/temperature';
import { formatShortDate } from '@/utils/dates';

interface Props {
  grid: HeatmapCellData[];
  weekStarts: string[];
}

interface TechniqueInfo {
  id: string;
  name: string;
  category: Category;
}

interface TechniqueGroup {
  groupName: string;
  category: Category;
  techniques: TechniqueInfo[];
}

function getGroupName(name: string): string {
  const arrowIdx = name.indexOf(' → ');
  return arrowIdx !== -1 ? name.substring(0, arrowIdx) : name;
}

function getSubName(name: string): string {
  const arrowIdx = name.indexOf(' → ');
  return arrowIdx !== -1 ? name.substring(arrowIdx + 3) : name;
}

export function HeatmapGrid({ grid, weekStarts }: Props) {
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());

  const filteredCategories: Category[] =
    selectedCategory === 'all' ? CATEGORIES : [selectedCategory];

  // Build cell lookup
  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCellData>();
    grid.forEach((cell) => {
      map.set(`${cell.techniqueId}-${cell.weekStart}`, cell);
    });
    return map;
  }, [grid]);

  // Get unique techniques for filtered categories
  const techniqueList = useMemo(() => {
    const techniques = new Map<string, TechniqueInfo>();
    grid.forEach((cell) => {
      if (filteredCategories.includes(cell.category) && !techniques.has(cell.techniqueId)) {
        techniques.set(cell.techniqueId, {
          id: cell.techniqueId,
          name: cell.techniqueName,
          category: cell.category,
        });
      }
    });
    return Array.from(techniques.values());
  }, [grid, selectedCategory]);

  // Group techniques by parent position
  const groups = useMemo(() => {
    const groupMap = new Map<string, TechniqueGroup>();
    techniqueList.forEach((tech) => {
      const gName = getGroupName(tech.name);
      const key = `${tech.category}:${gName}`;
      if (!groupMap.has(key)) {
        groupMap.set(key, { groupName: gName, category: tech.category, techniques: [] });
      }
      groupMap.get(key)!.techniques.push(tech);
    });
    return Array.from(groupMap.values());
  }, [techniqueList]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Aggregate cell counts for a group across a week
  const getGroupCount = (group: TechniqueGroup, weekStart: string): number => {
    let total = 0;
    group.techniques.forEach((t) => {
      const cell = cellMap.get(`${t.id}-${weekStart}`);
      if (cell) total += cell.count;
    });
    return total;
  };

  const getGroupColor = (count: number): string => {
    if (count === 0) return DARK_THEME.surfaceLight;
    const score = Math.min(count * 3, 10);
    return temperatureToColor(score);
  };

  return (
    <View style={styles.container}>
      {/* Category filter tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
        <Pressable
          style={[styles.filterTab, selectedCategory === 'all' && styles.filterTabActive]}
          onPress={() => setSelectedCategory('all')}
        >
          <Text style={[styles.filterText, selectedCategory === 'all' && styles.filterTextActive]}>
            All
          </Text>
        </Pressable>
        {CATEGORIES.map((cat) => (
          <Pressable
            key={cat}
            style={[styles.filterTab, selectedCategory === cat && styles.filterTabActive]}
            onPress={() => setSelectedCategory(cat)}
          >
            <Text style={[styles.filterText, selectedCategory === cat && styles.filterTextActive]}>
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

          {/* Grouped technique rows */}
          {groups.map((group) => {
            const groupKey = `${group.category}:${group.groupName}`;
            const isSingle = group.techniques.length === 1;
            const isExpanded = expandedGroups.has(groupKey);

            if (isSingle) {
              // Single technique — no grouping needed
              const tech = group.techniques[0];
              return (
                <View key={groupKey} style={styles.row}>
                  <View style={styles.labelCell}>
                    <Text style={styles.labelText} numberOfLines={1}>
                      {tech.name}
                    </Text>
                  </View>
                  {weekStarts.map((ws) => {
                    const cell = cellMap.get(`${tech.id}-${ws}`);
                    return (
                      <HeatmapCell key={ws} color={cell?.color ?? DARK_THEME.surfaceLight} />
                    );
                  })}
                </View>
              );
            }

            // Multi-technique group
            return (
              <View key={groupKey}>
                {/* Group header row (collapsed aggregate) */}
                <Pressable
                  style={styles.row}
                  onPress={() => toggleGroup(groupKey)}
                >
                  <View style={styles.labelCell}>
                    <Text style={styles.groupLabelText} numberOfLines={1}>
                      {isExpanded ? '▾' : '▸'} {group.groupName}{' '}
                      <Text style={styles.groupCount}>({group.techniques.length})</Text>
                    </Text>
                  </View>
                  {weekStarts.map((ws) => {
                    const count = getGroupCount(group, ws);
                    return (
                      <HeatmapCell key={ws} color={getGroupColor(count)} />
                    );
                  })}
                </Pressable>

                {/* Expanded sub-technique rows */}
                {isExpanded &&
                  group.techniques.map((tech) => (
                    <View key={tech.id} style={styles.row}>
                      <View style={styles.subLabelCell}>
                        <Text style={styles.subLabelText} numberOfLines={1}>
                          {getSubName(tech.name)}
                        </Text>
                      </View>
                      {weekStarts.map((ws) => {
                        const cell = cellMap.get(`${tech.id}-${ws}`);
                        return (
                          <HeatmapCell key={ws} color={cell?.color ?? DARK_THEME.surfaceLight} />
                        );
                      })}
                    </View>
                  ))}
              </View>
            );
          })}
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
  groupLabelText: {
    fontSize: 11,
    color: DARK_THEME.text,
    fontWeight: '600',
  },
  groupCount: {
    color: DARK_THEME.textMuted,
    fontWeight: '400',
  },
  subLabelCell: {
    width: 140,
    paddingRight: 8,
    paddingLeft: 16,
  },
  subLabelText: {
    fontSize: 10,
    color: DARK_THEME.textMuted,
  },
});
