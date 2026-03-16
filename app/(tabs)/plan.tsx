import React, { useState } from 'react';
import { View, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import * as Crypto from 'expo-crypto';
import { ClassForm, ClassFormData } from '@/components/ClassForm';
import { useDatabase } from '@/hooks/useDatabase';
import { createClassLog } from '@/db/classLogs';
import { DARK_THEME } from '@/constants/colors';
import { useLocalSearchParams } from 'expo-router';

export default function PlanClassScreen() {
  const { db, incrementDataVersion } = useDatabase();
  const params = useLocalSearchParams<{
    standing_zoom_in?: string;
    guard?: string;
    submission?: string;
  }>();
  const [key, setKey] = useState(0);

  const initialData = params.standing_zoom_in
    ? {
        standing_zoom_in: params.standing_zoom_in,
        guard: params.guard,
        submission: params.submission,
      }
    : undefined;

  const handleSubmit = (data: ClassFormData) => {
    if (!db) return;

    createClassLog(db, {
      id: Crypto.randomUUID(),
      ...data,
    });

    incrementDataVersion();
    Alert.alert('Saved!', 'Class plan saved successfully.');
    setKey((k) => k + 1);
  };

  if (!db) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={DARK_THEME.accent} />
      </View>
    );
  }

  return (
    <ClassForm
      key={key}
      initialData={initialData}
      onSubmit={handleSubmit}
      submitLabel="Save Class"
    />
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
