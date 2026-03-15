import React from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { DARK_THEME } from '@/constants/colors';
import { useClassLogs } from '@/hooks/useClassLogs';
import { ClassLogCard } from '@/components/ClassLogCard';

export default function HistoryScreen() {
  const { classLogs, loading } = useClassLogs();

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={DARK_THEME.accent} />
      </View>
    );
  }

  if (classLogs.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>No classes yet</Text>
        <Text style={styles.emptyText}>
          Plan your first class on the Plan tab to get started.
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      style={styles.list}
      data={classLogs}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ClassLogCard
          classLog={item}
          onPress={() => router.push(`/class/${item.id}`)}
        />
      )}
      contentContainerStyle={styles.contentContainer}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
  },
  contentContainer: {
    paddingVertical: 8,
  },
  loading: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  empty: {
    flex: 1,
    backgroundColor: DARK_THEME.background,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DARK_THEME.text,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: DARK_THEME.textSecondary,
    textAlign: 'center',
  },
});
