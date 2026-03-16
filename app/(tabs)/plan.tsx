import React, { useState } from 'react';
import { View, StyleSheet, ActivityIndicator, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { ClassForm, ClassFormData } from '@/components/ClassForm';
import { useDatabase } from '@/hooks/useDatabase';
import { createClassLog } from '@/db/classLogs';
import { DARK_THEME } from '@/constants/colors';

function generateId(): string {
  if (Platform.OS === 'web') return crypto.randomUUID();
  const Crypto = require('expo-crypto');
  return Crypto.randomUUID();
}

export default function PlanClassScreen() {
  const { db, incrementDataVersion } = useDatabase();
  const params = useLocalSearchParams<{
    standing?: string;
    guard?: string;
    pinning?: string;
    submission?: string;
  }>();
  const [resetCount, setResetCount] = useState(0);

  const paramsKey = `${params.standing}-${params.guard}-${params.pinning}-${params.submission}`;
  const initialData = params.standing
    ? {
        standing: params.standing,
        guard: params.guard,
        pinning: params.pinning || null,
        submission: params.submission,
      }
    : undefined;

  const handleSubmit = (data: ClassFormData) => {
    if (!db) return;

    const id = generateId();
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
