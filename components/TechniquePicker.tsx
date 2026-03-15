import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  FlatList,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { DARK_THEME } from '@/constants/colors';
import { CATEGORY_LABELS } from '@/constants/categories';
import { Category, TechniqueWithTemperature } from '@/types';
import { useTechniques } from '@/hooks/useTechniques';
import { TemperatureBadge } from './TemperatureBadge';

interface Props {
  category: Category;
  selectedId: string | null;
  onSelect: (id: string, name: string) => void;
}

export function TechniquePicker({ category, selectedId, onSelect }: Props) {
  const [visible, setVisible] = useState(false);
  const { techniques } = useTechniques(category);

  const selectedTechnique = techniques.find((t) => t.id === selectedId);

  // Sort coldest first
  const sorted = [...techniques].sort(
    (a, b) => a.temperature_score - b.temperature_score
  );

  const handleSelect = (item: TechniqueWithTemperature) => {
    onSelect(item.id, item.name);
    setVisible(false);
  };

  return (
    <View>
      <Text style={styles.label}>{CATEGORY_LABELS[category]}</Text>
      <Pressable
        style={styles.selector}
        onPress={() => setVisible(true)}
        hitSlop={8}
      >
        <Text
          style={[
            styles.selectorText,
            !selectedTechnique && styles.placeholderText,
          ]}
          numberOfLines={1}
        >
          {selectedTechnique?.name ?? `Select ${CATEGORY_LABELS[category]}...`}
        </Text>
      </Pressable>

      <Modal visible={visible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{CATEGORY_LABELS[category]}</Text>
            <Pressable onPress={() => setVisible(false)} hitSlop={12}>
              <Text style={styles.closeButton}>Done</Text>
            </Pressable>
          </View>
          <FlatList
            data={sorted}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <Pressable
                style={[
                  styles.item,
                  item.id === selectedId && styles.itemSelected,
                ]}
                onPress={() => handleSelect(item)}
              >
                <Text
                  style={[
                    styles.itemText,
                    item.id === selectedId && styles.itemTextSelected,
                  ]}
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <TemperatureBadge
                  color={item.temperature_color}
                  frequency={item.frequency_8wk}
                  daysSince={
                    item.last_taught
                      ? Math.round(
                          (Date.now() - new Date(item.last_taught).getTime()) /
                            86400000
                        )
                      : null
                  }
                />
              </Pressable>
            )}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_THEME.textSecondary,
    marginBottom: 6,
    marginTop: 16,
  },
  selector: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  selectorText: {
    fontSize: 16,
    color: DARK_THEME.text,
  },
  placeholderText: {
    color: DARK_THEME.textMuted,
  },
  modal: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: DARK_THEME.border,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  closeButton: {
    fontSize: 16,
    color: DARK_THEME.accent,
    fontWeight: '600',
  },
  item: {
    padding: 16,
    gap: 6,
  },
  itemSelected: {
    backgroundColor: DARK_THEME.surfaceLight,
  },
  itemText: {
    fontSize: 16,
    color: DARK_THEME.text,
  },
  itemTextSelected: {
    fontWeight: '600',
    color: DARK_THEME.accent,
  },
  separator: {
    height: 1,
    backgroundColor: DARK_THEME.border,
  },
});
