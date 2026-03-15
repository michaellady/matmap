import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { DARK_THEME } from '@/constants/colors';
import { SuggestedPlan } from '@/types';

interface Props {
  plan: SuggestedPlan;
  onUsePlan: (plan: SuggestedPlan) => void;
}

export function AutoSuggestCard({ plan, onUsePlan }: Props) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Suggested Class Plan</Text>
      <Text style={styles.subtitle}>Based on what you haven't covered recently</Text>

      <View style={styles.techniques}>
        <SuggestionRow label="Standing" name={plan.standing_zoom_in.name} />
        <SuggestionRow label="Guard" name={plan.guard.name} />
        <SuggestionRow label="Submission" name={plan.submission.name} />
      </View>

      <Pressable style={styles.button} onPress={() => onUsePlan(plan)}>
        <Text style={styles.buttonText}>Use This Plan</Text>
      </Pressable>
    </View>
  );
}

function SuggestionRow({ label, name }: { label: string; name: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowName} numberOfLines={2}>
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
    margin: 16,
    borderWidth: 1,
    borderColor: DARK_THEME.accent,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: DARK_THEME.text,
  },
  subtitle: {
    fontSize: 13,
    color: DARK_THEME.textSecondary,
    marginTop: 2,
    marginBottom: 14,
  },
  techniques: {
    gap: 8,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  rowLabel: {
    fontSize: 13,
    color: DARK_THEME.textMuted,
    width: 72,
    fontWeight: '500',
  },
  rowName: {
    fontSize: 14,
    color: DARK_THEME.text,
    flex: 1,
  },
  button: {
    backgroundColor: DARK_THEME.accent,
    borderRadius: 10,
    padding: 14,
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
