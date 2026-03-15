import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DARK_THEME } from '@/constants/colors';
import { useDatabase } from '@/hooks/useDatabase';
import { useClassLog } from '@/hooks/useClassLogs';
import { updateClassLog, deleteClassLog } from '@/db/classLogs';
import { ClassForm, ClassFormData } from '@/components/ClassForm';
import { formatDate } from '@/utils/dates';
import { CATEGORY_LABELS } from '@/constants/categories';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, incrementDataVersion } = useDatabase();
  const { classLog, loading } = useClassLog(id);
  const [editing, setEditing] = useState(false);

  if (loading || !classLog) {
    return (
      <View style={styles.loading}>
        {loading ? (
          <ActivityIndicator size="large" color={DARK_THEME.accent} />
        ) : (
          <Text style={styles.loadingText}>Class not found</Text>
        )}
      </View>
    );
  }

  const handleUpdate = (data: ClassFormData) => {
    if (!db || !id) return;
    updateClassLog(db, id, data);
    incrementDataVersion();
    setEditing(false);
    Alert.alert('Updated', 'Class updated successfully.');
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Class',
      'Are you sure you want to delete this class log? This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            if (!db || !id) return;
            deleteClassLog(db, id);
            incrementDataVersion();
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
            router.back();
          },
        },
      ]
    );
  };

  if (editing) {
    return (
      <ClassForm
        initialData={{
          date: classLog.date,
          week_theme: classLog.week_theme,
          standing_zoom_in: classLog.standing_zoom_in,
          guard: classLog.guard,
          submission: classLog.submission,
          guard_zoom_in_notes: classLog.guard_zoom_in_notes,
          notes: classLog.notes,
        }}
        onSubmit={handleUpdate}
        submitLabel="Update Class"
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(classLog.date)}</Text>
        {classLog.week_theme ? (
          <Text style={styles.theme}>{classLog.week_theme}</Text>
        ) : null}
      </View>

      <DetailRow label="Standing Zoom-In" value={classLog.standing_zoom_in_name} />
      <DetailRow label="Guard" value={classLog.guard_name} />
      <DetailRow label="Submission" value={classLog.submission_name} />

      {classLog.guard_zoom_in_notes ? (
        <DetailRow label="Guard Zoom-In Notes" value={classLog.guard_zoom_in_notes} />
      ) : null}

      {classLog.notes ? (
        <DetailRow label="Notes" value={classLog.notes} />
      ) : null}

      <View style={styles.actions}>
        <Pressable style={styles.editButton} onPress={() => setEditing(true)}>
          <Text style={styles.editButtonText}>Edit</Text>
        </Pressable>
        <Pressable style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
    padding: 16,
  },
  loading: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: DARK_THEME.textSecondary,
    fontSize: 16,
  },
  header: {
    marginBottom: 20,
  },
  date: {
    fontSize: 22,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  theme: {
    fontSize: 15,
    color: DARK_THEME.accent,
    marginTop: 4,
  },
  detailRow: {
    marginBottom: 16,
  },
  detailLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: DARK_THEME.textMuted,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: DARK_THEME.text,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  editButton: {
    flex: 1,
    backgroundColor: DARK_THEME.accent,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: DARK_THEME.surface,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: DARK_THEME.danger,
  },
  deleteButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_THEME.danger,
  },
});
