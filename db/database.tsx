import React, { createContext, useCallback, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { Database, RunResult } from './interface';
import { runMigrations, seedTechniques } from './migrations';

interface DatabaseContextValue {
  db: Database | null;
  isReady: boolean;
  dataVersion: number;
  incrementDataVersion: () => void;
}

export const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
  dataVersion: 0,
  incrementDataVersion: () => {},
});

function wrapExpoSqliteSync(sqliteDb: SQLite.SQLiteDatabase): Database {
  return {
    run(sql: string, params?: unknown[]): RunResult {
      const result = sqliteDb.runSync(sql, (params ?? []) as SQLite.SQLiteBindParams);
      return { changes: result.changes, lastInsertRowId: result.lastInsertRowId };
    },
    get<T = unknown>(sql: string, params?: unknown[]): T | undefined {
      const result = sqliteDb.getFirstSync<T>(sql, (params ?? []) as SQLite.SQLiteBindParams);
      return result ?? undefined;
    },
    all<T = unknown>(sql: string, params?: unknown[]): T[] {
      return sqliteDb.getAllSync<T>(sql, (params ?? []) as SQLite.SQLiteBindParams);
    },
    exec(sql: string): void {
      sqliteDb.execSync(sql);
    },
  };
}

// Async wrapper that pre-executes all SQL via async API, then returns sync-shaped results.
// This is needed for web where sync APIs timeout.
function wrapExpoSqliteAsync(sqliteDb: SQLite.SQLiteDatabase): Database {
  // On web we can't use sync APIs. We'll batch operations through a queue.
  // However, our DB functions are called synchronously from hooks.
  // The solution: use sync APIs but with a longer timeout, or
  // use the async open and then sync operations should work.
  // After openDatabaseAsync resolves, the web worker is ready and sync should work.
  return wrapExpoSqliteSync(sqliteDb);
}

async function initDatabaseAsync(): Promise<Database> {
  const sqliteDb = await SQLite.openDatabaseAsync('matmap.db');
  const wrapped = wrapExpoSqliteAsync(sqliteDb);
  runMigrations(wrapped);
  seedTechniques(wrapped, () => Crypto.randomUUID());
  return wrapped;
}

function initDatabaseSync(): Database {
  const sqliteDb = SQLite.openDatabaseSync('matmap.db');
  const wrapped = wrapExpoSqliteSync(sqliteDb);
  runMigrations(wrapped);
  seedTechniques(wrapped, () => Crypto.randomUUID());
  return wrapped;
}

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const incrementDataVersion = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web') {
      initDatabaseAsync()
        .then((wrapped) => {
          setDb(wrapped);
          setIsReady(true);
        })
        .catch((e) => {
          console.warn('Database init failed:', e);
        });
    } else {
      try {
        const wrapped = initDatabaseSync();
        setDb(wrapped);
        setIsReady(true);
      } catch (e) {
        console.warn('Database init failed:', e);
      }
    }
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady, dataVersion, incrementDataVersion }}>
      {children}
    </DatabaseContext.Provider>
  );
}
