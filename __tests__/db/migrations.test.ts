import { createSeededTestDb } from '../helpers/testDb';

describe('migrations', () => {
  it('creates technique table', () => {
    const db = createSeededTestDb();
    const tables = db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='technique'"
    );
    expect(tables).toHaveLength(1);
  });

  it('creates class_log table', () => {
    const db = createSeededTestDb();
    const tables = db.all<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name='class_log'"
    );
    expect(tables).toHaveLength(1);
  });

  it('seeds 22 techniques', () => {
    const db = createSeededTestDb();
    const result = db.get<{ count: number }>('SELECT COUNT(*) as count FROM technique');
    expect(result?.count).toBe(26);
  });

  it('seeds 10 standing techniques', () => {
    const db = createSeededTestDb();
    const result = db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM technique WHERE category = 'standing'"
    );
    expect(result?.count).toBe(10);
  });

  it('seeds 6 guard techniques', () => {
    const db = createSeededTestDb();
    const result = db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM technique WHERE category = 'guard'"
    );
    expect(result?.count).toBe(7);
  });

  it('seeds 6 submission techniques', () => {
    const db = createSeededTestDb();
    const result = db.get<{ count: number }>(
      "SELECT COUNT(*) as count FROM technique WHERE category = 'submission'"
    );
    expect(result?.count).toBe(6);
  });

  it('does not re-seed if techniques already exist', () => {
    const db = createSeededTestDb();
    const { seedTechniques } = require('../../db/migrations');
    seedTechniques(db, () => 'extra-id');
    const result = db.get<{ count: number }>('SELECT COUNT(*) as count FROM technique');
    expect(result?.count).toBe(26);
  });
});
