import React, { useState } from 'react';
import {
  View,
  Text,
  SectionList,
  Pressable,
  TextInput,
  Modal,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Crypto from 'expo-crypto';
import * as Haptics from 'expo-haptics';
import { DARK_THEME } from '@/constants/colors';
import { CATEGORIES, CATEGORY_LABELS } from '@/constants/categories';
import { Category, TechniqueWithTemperature } from '@/types';
import { useDatabase } from '@/hooks/useDatabase';
import { useTechniques } from '@/hooks/useTechniques';
import {
  createTechnique,
  updateTechnique,
  deleteTechnique,
  getTechniqueUsageCount,
} from '@/db/techniques';
import { TemperatureBadge } from '@/components/TemperatureBadge';

export default function TechniquesScreen() {
  const { db, incrementDataVersion } = useDatabase();
  const { techniques } = useTechniques();
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category>('standing');
  const [techniqueName, setTechniqueName] = useState('');

  const sections = CATEGORIES.map((cat) => ({
    title: CATEGORY_LABELS[cat],
    category: cat,
    data: techniques.filter((t) => t.category === cat),
  }));

  const handleAdd = (category: Category) => {
    setEditingId(null);
    setEditingCategory(category);
    setTechniqueName('');
    setModalVisible(true);
  };

  const handleEdit = (technique: TechniqueWithTemperature) => {
    setEditingId(technique.id);
    setEditingCategory(technique.category);
    setTechniqueName(technique.name);
    setModalVisible(true);
  };

  const handleSave = () => {
    if (!db || !techniqueName.trim()) return;

    if (editingId) {
      updateTechnique(db, editingId, techniqueName.trim());
    } else {
      createTechnique(db, Crypto.randomUUID(), techniqueName.trim(), editingCategory);
    }

    incrementDataVersion();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setModalVisible(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (!db) return;
    const usageCount = getTechniqueUsageCount(db, id);

    const message =
      usageCount > 0
        ? `"${name}" is used in ${usageCount} class log${usageCount > 1 ? 's' : ''}. It will be hidden from pickers but preserved in history.`
        : `Delete "${name}"? This cannot be undone.`;

    Alert.alert('Delete Technique', message, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteTechnique(db, id);
          incrementDataVersion();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        renderSectionHeader={({ section }) => (
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Pressable
              style={styles.addButton}
              onPress={() => handleAdd(section.category)}
              hitSlop={12}
            >
              <Text style={styles.addButtonText}>+ Add</Text>
            </Pressable>
          </View>
        )}
        renderItem={({ item }) => (
          <Pressable
            style={styles.item}
            onPress={() => handleEdit(item)}
            onLongPress={() => handleDelete(item.id, item.name)}
          >
            <Text style={styles.itemName} numberOfLines={2}>
              {item.name}
            </Text>
            <TemperatureBadge
              color={item.temperature_color}
              frequency={item.frequency_8wk}
              daysSince={
                item.last_taught
                  ? Math.round(
                      (Date.now() - new Date(item.last_taught).getTime()) / 86400000
                    )
                  : null
              }
            />
          </Pressable>
        )}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        stickySectionHeadersEnabled={false}
      />

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modal}>
          <View style={styles.modalHeader}>
            <Pressable onPress={() => setModalVisible(false)} hitSlop={12}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit' : 'Add'} Technique
            </Text>
            <Pressable onPress={handleSave} hitSlop={12}>
              <Text style={styles.saveText}>Save</Text>
            </Pressable>
          </View>
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>
              Category: {CATEGORY_LABELS[editingCategory]}
            </Text>
            <TextInput
              style={styles.modalInput}
              value={techniqueName}
              onChangeText={setTechniqueName}
              placeholder="Technique name..."
              placeholderTextColor={DARK_THEME.textMuted}
              autoFocus
            />
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: DARK_THEME.background,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  addButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: DARK_THEME.surface,
  },
  addButtonText: {
    fontSize: 13,
    color: DARK_THEME.accent,
    fontWeight: '600',
  },
  item: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 44,
    justifyContent: 'center',
    gap: 4,
  },
  itemName: {
    fontSize: 15,
    color: DARK_THEME.text,
  },
  separator: {
    height: 1,
    backgroundColor: DARK_THEME.border,
    marginLeft: 16,
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
    fontSize: 17,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  cancelText: {
    fontSize: 16,
    color: DARK_THEME.textSecondary,
  },
  saveText: {
    fontSize: 16,
    color: DARK_THEME.accent,
    fontWeight: '600',
  },
  modalContent: {
    padding: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: DARK_THEME.textSecondary,
    marginBottom: 12,
  },
  modalInput: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: DARK_THEME.text,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
});
