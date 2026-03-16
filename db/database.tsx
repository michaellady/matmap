import React, { createContext, useCallback, useEffect, useState } from 'react';
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

function generateId(): string {
  // Use expo-crypto on native, crypto.randomUUID on web
  if (Platform.OS === 'web') {
    return crypto.randomUUID();
  }
  const Crypto = require('expo-crypto');
  return Crypto.randomUUID();
}

// --- Native: expo-sqlite with sync API ---
function initNativeDatabase(): Database {
  const SQLite = require('expo-sqlite');
  const sqliteDb = SQLite.openDatabaseSync('matmap.db');

  const db: Database = {
    run(sql: string, params?: unknown[]): RunResult {
      const result = sqliteDb.runSync(sql, params ?? []);
      return { changes: result.changes, lastInsertRowId: result.lastInsertRowId };
    },
    get<T = unknown>(sql: string, params?: unknown[]): T | undefined {
      const result = sqliteDb.getFirstSync(sql, params ?? []);
      return (result ?? undefined) as T | undefined;
    },
    all<T = unknown>(sql: string, params?: unknown[]): T[] {
      return sqliteDb.getAllSync(sql, params ?? []) as T[];
    },
    exec(sql: string): void {
      sqliteDb.execSync(sql);
    },
  };

  runMigrations(db);
  seedTechniques(db, generateId);
  return db;
}

// --- Web: sql.js (SQLite compiled to WASM, runs in main thread) ---
async function initWebDatabase(): Promise<Database> {
  const initSqlJs = (await import('sql.js')).default;
  const SQL = await initSqlJs({
    locateFile: () => '/matmap/sql-wasm.wasm',
  });
  const sqlDb = new SQL.Database();

  const db: Database = {
    run(sql: string, params?: unknown[]): RunResult {
      sqlDb.run(sql, params as any[]);
      const changes = sqlDb.getRowsModified();
      const lastId = (sqlDb.exec('SELECT last_insert_rowid()')[0]?.values[0]?.[0] as number) ?? 0;
      return { changes, lastInsertRowId: lastId };
    },
    get<T = unknown>(sql: string, params?: unknown[]): T | undefined {
      const stmt = sqlDb.prepare(sql);
      if (params?.length) stmt.bind(params as any[]);
      if (!stmt.step()) {
        stmt.free();
        return undefined;
      }
      const columns = stmt.getColumnNames();
      const values = stmt.get();
      stmt.free();
      const row: any = {};
      columns.forEach((col, i) => { row[col] = values[i]; });
      return row as T;
    },
    all<T = unknown>(sql: string, params?: unknown[]): T[] {
      const stmt = sqlDb.prepare(sql);
      if (params?.length) stmt.bind(params as any[]);
      const results: T[] = [];
      const columns = stmt.getColumnNames();
      while (stmt.step()) {
        const values = stmt.get();
        const row: any = {};
        columns.forEach((col, i) => { row[col] = values[i]; });
        results.push(row as T);
      }
      stmt.free();
      return results;
    },
    exec(sql: string): void {
      sqlDb.run(sql);
    },
  };

  runMigrations(db);
  seedTechniques(db, generateId);
  return db;
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
      initWebDatabase()
        .then((wrapped) => {
          setDb(wrapped);
          setIsReady(true);
        })
        .catch((e) => {
          console.error('Web database init failed:', e);
        });
    } else {
      try {
        const wrapped = initNativeDatabase();
        setDb(wrapped);
        setIsReady(true);
      } catch (e) {
        console.error('Database init failed:', e);
      }
    }
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady, dataVersion, incrementDataVersion }}>
      {children}
    </DatabaseContext.Provider>
  );
}
