import { Database } from './interface';
import { SEED_TECHNIQUES } from '@/constants/seedData';

export function runMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS technique (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('standing', 'guard', 'pinning', 'submission')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      deleted_at TEXT
    );

    CREATE TABLE IF NOT EXISTS class_log (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      week_theme TEXT NOT NULL DEFAULT '',
      standing TEXT NOT NULL REFERENCES technique(id),
      guard TEXT NOT NULL REFERENCES technique(id),
      pinning TEXT REFERENCES technique(id),
      submission TEXT NOT NULL REFERENCES technique(id),
      guard_notes TEXT NOT NULL DEFAULT '',
      notes TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE INDEX IF NOT EXISTS idx_class_log_date ON class_log(date);
    CREATE INDEX IF NOT EXISTS idx_technique_category ON technique(category);
  `);

  // Migration: rename old columns if upgrading from old schema
  // Check if old column names exist and migrate
  try {
    db.get("SELECT standing_zoom_in FROM class_log LIMIT 0");
    // Old schema exists — migrate
    db.exec(`
      ALTER TABLE class_log RENAME COLUMN standing_zoom_in TO standing;
      ALTER TABLE class_log RENAME COLUMN guard_zoom_in_notes TO guard_notes;
    `);
    // Add pinning column
    db.exec(`ALTER TABLE class_log ADD COLUMN pinning TEXT REFERENCES technique(id)`);
    // Migrate old category values
    db.run("UPDATE technique SET category = 'standing' WHERE category = 'standing_zoom_in'");
  } catch {
    // New schema or already migrated — ignore
  }

  // Also try adding pinning column if it doesn't exist (idempotent)
  try {
    db.get("SELECT pinning FROM class_log LIMIT 0");
  } catch {
    try {
      db.exec(`ALTER TABLE class_log ADD COLUMN pinning TEXT REFERENCES technique(id)`);
    } catch {
      // Already exists
    }
  }
}

export function seedTechniques(db: Database, generateId: () => string): void {
  const existing = db.get<{ count: number }>('SELECT COUNT(*) as count FROM technique');
  if (existing && existing.count > 0) {
    // Seed any new techniques that don't exist yet (e.g., pinning added later)
    for (const t of SEED_TECHNIQUES) {
      const found = db.get<{ id: string }>(
        'SELECT id FROM technique WHERE name = ? AND category = ?',
        [t.name, t.category]
      );
      if (!found) {
        db.run('INSERT INTO technique (id, name, category) VALUES (?, ?, ?)', [
          generateId(),
          t.name,
          t.category,
        ]);
      }
    }
    return;
  }

  const stmt = 'INSERT INTO technique (id, name, category) VALUES (?, ?, ?)';
  for (const t of SEED_TECHNIQUES) {
    db.run(stmt, [generateId(), t.name, t.category]);
  }
}
