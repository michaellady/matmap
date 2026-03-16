import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import * as Crypto from 'expo-crypto';
import { router, useLocalSearchParams } from 'expo-router';
import { ClassForm, ClassFormData } from '@/components/ClassForm';
import { useDatabase } from '@/hooks/useDatabase';
import { createClassLog } from '@/db/classLogs';
import { DARK_THEME } from '@/constants/colors';

export default function PlanClassScreen() {
  const { db, incrementDataVersion } = useDatabase();
  const params = useLocalSearchParams<{
    standing_zoom_in?: string;
    guard?: string;
    submission?: string;
  }>();
  const [resetCount, setResetCount] = useState(0);

  const paramsKey = `${params.standing_zoom_in}-${params.guard}-${params.submission}`;
  const initialData = params.standing_zoom_in
    ? {
        standing_zoom_in: params.standing_zoom_in,
        guard: params.guard,
        submission: params.submission,
      }
    : undefined;

  const handleSubmit = (data: ClassFormData) => {
    if (!db) return;

    const id = Crypto.randomUUID();
    createClassLog(db, { id, ...data });
    incrementDataVersion();
    router.push(`/class/${id}`);
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
      key={`${paramsKey}-${resetCount}`}
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
