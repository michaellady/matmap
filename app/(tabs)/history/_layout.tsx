import { Stack } from 'expo-router';
import { DARK_THEME } from '@/constants/colors';

export default function HistoryLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: DARK_THEME.background },
        headerTintColor: DARK_THEME.text,
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Class History' }} />
    </Stack>
  );
}
