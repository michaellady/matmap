import React, { createContext, useCallback, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
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

function wrapExpoSqlite(sqliteDb: SQLite.SQLiteDatabase): Database {
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

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);

  const incrementDataVersion = useCallback(() => {
    setDataVersion((v) => v + 1);
  }, []);

  useEffect(() => {
    try {
      const sqliteDb = SQLite.openDatabaseSync('matmap.db');
      const wrapped = wrapExpoSqlite(sqliteDb);
      runMigrations(wrapped);
      seedTechniques(wrapped, () => Crypto.randomUUID());
      setDb(wrapped);
      setIsReady(true);
    } catch (e) {
      console.warn('Database init failed (service worker may still be loading):', e);
      // On web, the first load before the coi-serviceworker is active
      // will fail because SharedArrayBuffer is not available.
      // The service worker will reload the page automatically.
    }
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady, dataVersion, incrementDataVersion }}>
      {children}
    </DatabaseContext.Provider>
  );
}
