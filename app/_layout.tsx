import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { DatabaseProvider } from '@/db/database';

export { ErrorBoundary } from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <DatabaseProvider>
      <ThemeProvider value={DarkTheme}>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="class/[id]"
            options={{
              title: 'Class Details',
              headerStyle: { backgroundColor: '#111827' },
              headerTintColor: '#F9FAFB',
            }}
          />
        </Stack>
        <StatusBar style="light" />
      </ThemeProvider>
    </DatabaseProvider>
  );
}
