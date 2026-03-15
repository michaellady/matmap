import { useContext } from 'react';
import { DatabaseContext } from '@/db/database';

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context.db && context.isReady) {
    throw new Error('Database not available');
  }
  return context;
}
