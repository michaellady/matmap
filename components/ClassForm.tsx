import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from 'react-native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import * as Haptics from 'expo-haptics';
import { DARK_THEME } from '@/constants/colors';
import { TechniquePicker } from './TechniquePicker';
import { toDateString } from '@/utils/dates';

export interface ClassFormData {
  date: string;
  week_theme: string;
  standing_zoom_in: string;
  guard: string;
  submission: string;
  guard_zoom_in_notes: string;
  notes: string;
}

interface Props {
  initialData?: Partial<ClassFormData>;
  onSubmit: (data: ClassFormData) => void;
  submitLabel?: string;
}

const WIN_CONDITIONS = [
  'Get to front headlock and get their hands to the mat for 3 seconds',
  'Get to front body lock',
  'Get to back body lock via 2 on 1 or duck under',
  'Get to a single leg',
];

export function ClassForm({ initialData, onSubmit, submitLabel = 'Save Class' }: Props) {
  const [date, setDate] = useState(
    initialData?.date ? new Date(initialData.date + 'T12:00:00') : new Date()
  );
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [weekTheme, setWeekTheme] = useState(initialData?.week_theme ?? '');
  const [standingZoomIn, setStandingZoomIn] = useState(initialData?.standing_zoom_in ?? '');
  const [standingZoomInName, setStandingZoomInName] = useState('');
  const [guard, setGuard] = useState(initialData?.guard ?? '');
  const [guardName, setGuardName] = useState('');
  const [submission, setSubmission] = useState(initialData?.submission ?? '');
  const [submissionName, setSubmissionName] = useState('');
  const [guardZoomInNotes, setGuardZoomInNotes] = useState(
    initialData?.guard_zoom_in_notes ?? ''
  );
  const [notes, setNotes] = useState(initialData?.notes ?? '');

  const handleDateChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSubmit = () => {
    if (!standingZoomIn || !guard || !submission) {
      Alert.alert('Missing selections', 'Please select a technique for each category.');
      return;
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onSubmit({
      date: toDateString(date),
      week_theme: weekTheme,
      standing_zoom_in: standingZoomIn,
      guard,
      submission,
      guard_zoom_in_notes: guardZoomInNotes,
      notes,
    });
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.flex}
    >
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        {/* Win Conditions Card */}
        <View style={styles.winConditionsCard}>
          <Text style={styles.winConditionsTitle}>
            Ties to Takedowns — Win Conditions
          </Text>
          <Text style={styles.winConditionsSubtitle}>
            Both players trying to achieve any of these:
          </Text>
          {WIN_CONDITIONS.map((condition, i) => (
            <Text key={i} style={styles.winConditionItem}>
              • {condition}
            </Text>
          ))}
        </View>

        {/* Date Picker */}
        <Text style={styles.label}>Date</Text>
        <Pressable
          style={styles.dateSelector}
          onPress={() => setShowDatePicker(true)}
          hitSlop={8}
        >
          <Text style={styles.dateText}>{toDateString(date)}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            display="default"
            onChange={handleDateChange}
            themeVariant="dark"
          />
        )}

        {/* Week Theme */}
        <Text style={styles.label}>Week Theme</Text>
        <TextInput
          style={styles.input}
          value={weekTheme}
          onChangeText={setWeekTheme}
          placeholder="e.g., Front headlock week"
          placeholderTextColor={DARK_THEME.textMuted}
        />

        {/* Technique Pickers */}
        <TechniquePicker
          category="standing_zoom_in"
          selectedId={standingZoomIn || null}
          onSelect={(id, name) => {
            setStandingZoomIn(id);
            setStandingZoomInName(name);
          }}
        />

        <TechniquePicker
          category="guard"
          selectedId={guard || null}
          onSelect={(id, name) => {
            setGuard(id);
            setGuardName(name);
          }}
        />

        <TechniquePicker
          category="submission"
          selectedId={submission || null}
          onSelect={(id, name) => {
            setSubmission(id);
            setSubmissionName(name);
          }}
        />

        {/* Guard Zoom-In Notes */}
        <Text style={styles.label}>Guard Zoom-In Notes</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={guardZoomInNotes}
          onChangeText={setGuardZoomInNotes}
          placeholder="Specific details about guard work..."
          placeholderTextColor={DARK_THEME.textMuted}
          multiline
          numberOfLines={3}
        />

        {/* Notes */}
        <Text style={styles.label}>Notes</Text>
        <TextInput
          style={[styles.input, styles.multilineInput]}
          value={notes}
          onChangeText={setNotes}
          placeholder="General class notes..."
          placeholderTextColor={DARK_THEME.textMuted}
          multiline
          numberOfLines={3}
        />

        {/* Submit */}
        <Pressable style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitText}>{submitLabel}</Text>
        </Pressable>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
  },
  content: {
    padding: 16,
  },
  winConditionsCard: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
    marginBottom: 8,
  },
  winConditionsTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: DARK_THEME.text,
    marginBottom: 4,
  },
  winConditionsSubtitle: {
    fontSize: 13,
    color: DARK_THEME.textSecondary,
    marginBottom: 8,
  },
  winConditionItem: {
    fontSize: 13,
    color: DARK_THEME.textSecondary,
    marginBottom: 2,
    paddingLeft: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: DARK_THEME.textSecondary,
    marginBottom: 6,
    marginTop: 16,
  },
  dateSelector: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: 10,
    padding: 14,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  dateText: {
    fontSize: 16,
    color: DARK_THEME.text,
  },
  input: {
    backgroundColor: DARK_THEME.surface,
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    color: DARK_THEME.text,
    borderWidth: 1,
    borderColor: DARK_THEME.border,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: DARK_THEME.accent,
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginTop: 24,
  },
  submitText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bottomSpacer: {
    height: 40,
  },
});
