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

interface CategorySection {
  category: Category;
  groups: TechniqueGroup[];
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

  const cellMap = useMemo(() => {
    const map = new Map<string, HeatmapCellData>();
    grid.forEach((cell) => {
      map.set(`${cell.techniqueId}-${cell.weekStart}`, cell);
    });
    return map;
  }, [grid]);

  // Build sections: category → groups → techniques
  const sections = useMemo(() => {
    // Collect techniques per category
    const techByCategory = new Map<Category, TechniqueInfo[]>();
    filteredCategories.forEach((cat) => techByCategory.set(cat, []));

    grid.forEach((cell) => {
      if (!filteredCategories.includes(cell.category)) return;
      const list = techByCategory.get(cell.category)!;
      if (!list.find((t) => t.id === cell.techniqueId)) {
        list.push({ id: cell.techniqueId, name: cell.techniqueName, category: cell.category });
      }
    });

    // Build groups within each category
    const result: CategorySection[] = [];
    filteredCategories.forEach((cat) => {
      const techniques = techByCategory.get(cat) ?? [];
      if (techniques.length === 0) return;

      const groupMap = new Map<string, TechniqueGroup>();
      techniques.forEach((tech) => {
        const gName = getGroupName(tech.name);
        if (!groupMap.has(gName)) {
          groupMap.set(gName, { groupName: gName, category: cat, techniques: [] });
        }
        groupMap.get(gName)!.techniques.push(tech);
      });

      result.push({ category: cat, groups: Array.from(groupMap.values()) });
    });

    return result;
  }, [grid, selectedCategory]);

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

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
    return temperatureToColor(Math.min(count * 3, 10));
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

          {/* Category sections */}
          {sections.map((section) => (
            <View key={section.category}>
              {/* Category header */}
              <View style={styles.categoryHeader}>
                <Text style={styles.categoryHeaderText}>
                  {CATEGORY_LABELS[section.category]}
                </Text>
              </View>

              {/* Groups within category */}
              {section.groups.map((group) => {
                const groupKey = `${group.category}:${group.groupName}`;
                const isSingle = group.techniques.length === 1;
                const isExpanded = expandedGroups.has(groupKey);

                if (isSingle) {
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

                return (
                  <View key={groupKey}>
                    <Pressable style={styles.row} onPress={() => toggleGroup(groupKey)}>
                      <View style={styles.labelCell}>
                        <Text style={styles.groupLabelText} numberOfLines={1}>
                          {isExpanded ? '▾' : '▸'} {group.groupName}{' '}
                          <Text style={styles.groupCount}>({group.techniques.length})</Text>
                        </Text>
                      </View>
                      {weekStarts.map((ws) => (
                        <HeatmapCell key={ws} color={getGroupColor(getGroupCount(group, ws))} />
                      ))}
                    </Pressable>

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
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  filterBar: { flexDirection: 'row', marginBottom: 12, paddingHorizontal: 16 },
  filterTab: {
    paddingHorizontal: 14, paddingVertical: 8, borderRadius: 8,
    marginRight: 8, backgroundColor: DARK_THEME.surface,
  },
  filterTabActive: { backgroundColor: DARK_THEME.accent },
  filterText: { fontSize: 13, color: DARK_THEME.textSecondary, fontWeight: '500' },
  filterTextActive: { color: '#FFFFFF' },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  weekHeader: { width: 32, alignItems: 'center' },
  weekHeaderText: { fontSize: 10, color: DARK_THEME.textMuted },
  categoryHeader: {
    paddingVertical: 6, paddingLeft: 2, marginTop: 8,
    borderBottomWidth: 1, borderBottomColor: DARK_THEME.border,
  },
  categoryHeaderText: {
    fontSize: 13, fontWeight: '700', color: DARK_THEME.accent,
    textTransform: 'uppercase', letterSpacing: 0.5,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  labelCell: { width: 140, paddingRight: 8 },
  labelText: { fontSize: 11, color: DARK_THEME.textSecondary },
  groupLabelText: { fontSize: 11, color: DARK_THEME.text, fontWeight: '600' },
  groupCount: { color: DARK_THEME.textMuted, fontWeight: '400' },
  subLabelCell: { width: 140, paddingRight: 8, paddingLeft: 16 },
  subLabelText: { fontSize: 10, color: DARK_THEME.textMuted },
});
