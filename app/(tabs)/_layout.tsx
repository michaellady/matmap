import React from 'react';
import { Tabs } from 'expo-router';
import { DARK_THEME } from '@/constants/colors';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: DARK_THEME.accent,
        tabBarInactiveTintColor: DARK_THEME.textMuted,
        tabBarStyle: {
          backgroundColor: DARK_THEME.surface,
          borderTopColor: DARK_THEME.border,
        },
        headerStyle: {
          backgroundColor: DARK_THEME.background,
        },
        headerTintColor: DARK_THEME.text,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Plan Class',
          tabBarLabel: 'Plan',
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          title: 'The Map',
          tabBarLabel: 'Map',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="techniques"
        options={{
          title: 'Techniques',
        }}
      />
    </Tabs>
  );
}
