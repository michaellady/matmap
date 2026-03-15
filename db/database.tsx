import React, { createContext, useCallback, useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import * as Crypto from 'expo-crypto';
import { Platform } from 'react-native';
import { Database, RunResult } from './interface';
import { SEED_TECHNIQUES } from '@/constants/seedData';

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

// On web, wrap the async API to look sync by caching the SQLiteDatabase
// after async init. The key is: open async, migrate async, then use sync.
async function initDatabaseOnWeb(): Promise<Database> {
  const sqliteDb = await SQLite.openDatabaseAsync('matmap.db');

  // Run migrations via async API
  await sqliteDb.execAsync(`
    CREATE TABLE IF NOT EXISTS technique (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('standing_zoom_in', 'guard', 'submission')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT
    );
    CREATE TABLE IF NOT EXISTS class_log (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      week_theme TEXT NOT NULL DEFAULT '',
      standing_zoom_in TEXT NOT NULL REFERENCES technique(id),
      guard TEXT NOT NULL REFERENCES technique(id),
      submission TEXT NOT NULL REFERENCES technique(id),
      guard_zoom_in_notes TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
    CREATE INDEX IF NOT EXISTS idx_class_log_date ON class_log(date);
    CREATE INDEX IF NOT EXISTS idx_technique_category ON technique(category);
  `);

  // Seed via async API
  const existing = await sqliteDb.getFirstAsync<{ count: number }>('SELECT COUNT(*) as count FROM technique');
  if (!existing || existing.count === 0) {
    for (const t of SEED_TECHNIQUES) {
      await sqliteDb.runAsync(
        'INSERT INTO technique (id, name, category) VALUES (?, ?, ?)',
        [Crypto.randomUUID(), t.name, t.category]
      );
    }
  }

  // Now wrap with sync interface — the worker is fully initialized
  // so sync operations should work
  return wrapExpoSqliteSync(sqliteDb);
}

function initDatabaseNative(): Database {
  const sqliteDb = SQLite.openDatabaseSync('matmap.db');
  const wrapped = wrapExpoSqliteSync(sqliteDb);

  // Import and run migrations synchronously on native
  const { runMigrations, seedTechniques } = require('./migrations');
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
      initDatabaseOnWeb()
        .then((wrapped) => {
          setDb(wrapped);
          setIsReady(true);
        })
        .catch((e) => {
          console.warn('Database init failed:', e);
        });
    } else {
      try {
        const wrapped = initDatabaseNative();
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
