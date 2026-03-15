import { Database } from './interface';
import { SEED_TECHNIQUES } from '@/constants/seedData';

export function runMigrations(db: Database): void {
  db.exec(`
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
}

export function seedTechniques(db: Database, generateId: () => string): void {
  const existing = db.get<{ count: number }>('SELECT COUNT(*) as count FROM technique');
  if (existing && existing.count > 0) return;

  const stmt = 'INSERT INTO technique (id, name, category) VALUES (?, ?, ?)';
  for (const t of SEED_TECHNIQUES) {
    db.run(stmt, [generateId(), t.name, t.category]);
  }
}
