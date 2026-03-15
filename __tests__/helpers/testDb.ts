import BetterSqlite3 from 'better-sqlite3';
import { Database, RunResult } from '../../db/interface';
import { runMigrations, seedTechniques } from '../../db/migrations';

let idCounter = 0;

function testGenerateId(): string {
  idCounter++;
  return `test-id-${idCounter.toString().padStart(4, '0')}`;
}

export function createTestDb(): Database {
  const raw = new BetterSqlite3(':memory:');

  const db: Database = {
    run(sql: string, params?: unknown[]): RunResult {
      const result = raw.prepare(sql).run(...(params ?? []));
      return { changes: result.changes, lastInsertRowId: Number(result.lastInsertRowid) };
    },
    get<T = unknown>(sql: string, params?: unknown[]): T | undefined {
      return raw.prepare(sql).get(...(params ?? [])) as T | undefined;
    },
    all<T = unknown>(sql: string, params?: unknown[]): T[] {
      return raw.prepare(sql).all(...(params ?? [])) as T[];
    },
    exec(sql: string): void {
      raw.exec(sql);
    },
  };

  return db;
}

export function createSeededTestDb(): Database {
  idCounter = 0;
  const db = createTestDb();
  runMigrations(db);
  seedTechniques(db, testGenerateId);
  return db;
}

export function resetIdCounter(): void {
  idCounter = 0;
}
