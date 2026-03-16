import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DARK_THEME } from '@/constants/colors';
import { ClassLogWithTechniques } from '@/types';
import { formatDate } from '@/utils/dates';

interface Props {
  classLog: ClassLogWithTechniques;
  onPress: () => void;
}

export function ClassLogCard({ classLog, onPress }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.date}>{formatDate(classLog.date)}</Text>
        {classLog.week_theme ? (
          <Text style={styles.theme} numberOfLines={1}>
            {classLog.week_theme}
          </Text>
        ) : null}
      </View>
      <View style={styles.techniques}>
        <TechniqueRow label="Standing" name={classLog.standing_zoom_in_name} />
        <TechniqueRow label="Guard/Pass" name={classLog.guard_name} />
        <TechniqueRow label="Submission" name={classLog.submission_name} />
      </View>
    </Pressable>
  );
}

function TechniqueRow({ label, name }: { label: string; name: string }) {
  return (
    <View style={styles.techniqueRow}>
      <Text style={styles.techniqueLabel}>{label}</Text>
      <Text style={styles.techniqueName} numberOfLines={1}>
        {name}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 16,
    marginVertical: 6,
    minHeight: 44,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  date: {
    fontSize: 16,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  theme: {
    fontSize: 13,
    color: DARK_THEME.accent,
    fontWeight: '500',
    maxWidth: '50%',
  },
  techniques: {
    gap: 6,
  },
  techniqueRow: {
    flexDirection: 'row',
    gap: 8,
  },
  techniqueLabel: {
    fontSize: 13,
    color: DARK_THEME.textMuted,
    width: 72,
  },
  techniqueName: {
    fontSize: 13,
    color: DARK_THEME.textSecondary,
    flex: 1,
  },
});
