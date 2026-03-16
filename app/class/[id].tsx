import React, { useState } from 'react';
import { View, Text, Pressable, Alert, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { DARK_THEME } from '@/constants/colors';
import { useDatabase } from '@/hooks/useDatabase';
import { useClassLog } from '@/hooks/useClassLogs';
import { updateClassLog, deleteClassLog } from '@/db/classLogs';
import { ClassForm, ClassFormData } from '@/components/ClassForm';
import { formatDate } from '@/utils/dates';

export default function ClassDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { db, incrementDataVersion } = useDatabase();
  const { classLog, loading } = useClassLog(id);
  const [editing, setEditing] = useState(false);

  const goToMap = () => router.replace('/');

  if (loading || !classLog) {
    return (
      <View style={styles.loading}>
        <Stack.Screen options={{ headerLeft: () => <BackToMap onPress={goToMap} /> }} />
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
  };

  const handleDelete = () => {
    Alert.alert('Delete Class', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          if (!db || !id) return;
          deleteClassLog(db, id);
          incrementDataVersion();
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          router.replace('/');
        },
      },
    ]);
  };

  if (editing) {
    return (
      <ClassForm
        initialData={{
          date: classLog.date,
          standing: classLog.standing,
          guard: classLog.guard,
          pinning: classLog.pinning,
          submission: classLog.submission,
          guard_notes: classLog.guard_notes,
          notes: classLog.notes,
        }}
        onSubmit={handleUpdate}
        submitLabel="Update Class"
      />
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerLeft: () => <BackToMap onPress={goToMap} /> }} />
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(classLog.date)}</Text>
      </View>

      <DetailRow label="Standing" value={classLog.standing_name} />
      <DetailRow label="Guard vs. Passing" value={classLog.guard_name} />
      {classLog.guard_notes ? (
        <DetailRow label="Guard Follow On" value={classLog.guard_notes} />
      ) : null}
      {classLog.pinning_name ? (
        <DetailRow label="Pinning" value={classLog.pinning_name} />
      ) : null}
      <DetailRow label="Submission" value={classLog.submission_name} />

      {classLog.notes ? <DetailRow label="Notes" value={classLog.notes} /> : null}

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

function BackToMap({ onPress }: { onPress: () => void }) {
  return (
    <Pressable onPress={onPress} hitSlop={12} style={{ paddingRight: 8 }}>
      <Text style={{ color: DARK_THEME.accent, fontSize: 16 }}>← Map</Text>
    </Pressable>
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
  container: { flex: 1, backgroundColor: DARK_THEME.background, padding: 16 },
  loading: { flex: 1, backgroundColor: DARK_THEME.background, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: DARK_THEME.textSecondary, fontSize: 16 },
  header: { marginBottom: 20 },
  date: { fontSize: 22, fontWeight: '700', color: DARK_THEME.text },
  detailRow: { marginBottom: 16 },
  detailLabel: { fontSize: 13, fontWeight: '600', color: DARK_THEME.textMuted, marginBottom: 4 },
  detailValue: { fontSize: 16, color: DARK_THEME.text },
  actions: { flexDirection: 'row', gap: 12, marginTop: 24 },
  editButton: { flex: 1, backgroundColor: DARK_THEME.accent, borderRadius: 12, padding: 14, alignItems: 'center' },
  editButtonText: { fontSize: 16, fontWeight: '700', color: '#FFFFFF' },
  deleteButton: {
    flex: 1, backgroundColor: DARK_THEME.surface, borderRadius: 12, padding: 14,
    alignItems: 'center', borderWidth: 1, borderColor: DARK_THEME.danger,
  },
  deleteButtonText: { fontSize: 16, fontWeight: '700', color: DARK_THEME.danger },
});
