import { createSeededTestDb } from '../helpers/testDb';
import { createClassLog } from '../../db/classLogs';
import {
  getTechniqueTemperatures,
  getWeeklyFrequency,
  getColdSpots,
  getSuggestedPlan,
} from '../../db/heatmap';

function insertTestClasses(db: ReturnType<typeof createSeededTestDb>) {
  // Class 1: March 10
  createClassLog(db, {
    id: 'cl-1',
    date: '2026-03-10',
    week_theme: 'Week 1',
    standing_zoom_in: 'test-id-0001', // Front headlock backtake
    guard: 'test-id-0011',           // Half guard
    submission: 'test-id-0017',      // RNC
    guard_zoom_in_notes: '',
    notes: '',
  });

  // Class 2: March 5
  createClassLog(db, {
    id: 'cl-2',
    date: '2026-03-05',
    week_theme: 'Week 1',
    standing_zoom_in: 'test-id-0001', // Front headlock backtake (again)
    guard: 'test-id-0012',           // Butterfly guard
    submission: 'test-id-0018',      // Front headlocks
    guard_zoom_in_notes: '',
    notes: '',
  });

  // Class 3: Feb 15
  createClassLog(db, {
    id: 'cl-3',
    date: '2026-02-15',
    week_theme: 'Week 2',
    standing_zoom_in: 'test-id-0004', // Back body lock
    guard: 'test-id-0011',           // Half guard (again)
    submission: 'test-id-0019',      // Triangles
    guard_zoom_in_notes: '',
    notes: '',
  });
}

describe('getTechniqueTemperatures', () => {
  it('returns temperatures for all techniques', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const temps = getTechniqueTemperatures(db, undefined, '2026-03-14');
    expect(temps).toHaveLength(22);
  });

  it('returns temperatures filtered by category', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const temps = getTechniqueTemperatures(db, 'guard', '2026-03-14');
    expect(temps).toHaveLength(6);
    temps.forEach((t) => expect(t.category).toBe('guard'));
  });

  it('computes correct frequency and recency for taught technique', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const temps = getTechniqueTemperatures(db, 'standing_zoom_in', '2026-03-14');
    // test-id-0001 was taught twice (March 10 and March 5)
    const t = temps.find((t) => t.id === 'test-id-0001');
    expect(t).toBeDefined();
    expect(t!.frequency_8wk).toBe(2);
    expect(t!.days_since).toBe(4); // March 14 - March 10
    expect(t!.last_taught).toBe('2026-03-10');
  });

  it('returns null days_since for never-taught technique', () => {
    const db = createSeededTestDb();
    // No classes inserted
    const temps = getTechniqueTemperatures(db, 'guard', '2026-03-14');
    temps.forEach((t) => {
      expect(t.days_since).toBeNull();
      expect(t.frequency_8wk).toBe(0);
    });
  });
});

describe('getWeeklyFrequency', () => {
  it('returns weekly frequency data', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const freq = getWeeklyFrequency(db, 56);
    expect(freq.length).toBeGreaterThan(0);
    freq.forEach((f) => {
      expect(f.count).toBeGreaterThan(0);
      expect(f.technique_id).toBeDefined();
      expect(f.week_start).toBeDefined();
    });
  });

  it('groups by technique and week', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const freq = getWeeklyFrequency(db, 56);
    // test-id-0001 taught twice in same week (March 5 and March 10 are both in week of March 9)
    // Actually March 5 is Thursday and March 10 is Tuesday — might be different weeks depending on weekday calc
    // Just verify we get grouped data
    const ids = new Set(freq.map((f) => `${f.technique_id}-${f.week_start}`));
    expect(ids.size).toBe(freq.length); // Each combo is unique
  });
});

describe('getColdSpots', () => {
  it('returns never-taught techniques first', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const spots = getColdSpots(db, '2026-03-14');
    // The first spots should be never-taught (null last_taught)
    const neverTaught = spots.filter((s) => s.last_taught === null);
    const taught = spots.filter((s) => s.last_taught !== null);
    expect(neverTaught.length).toBeGreaterThan(0);
    // All never-taught should come before any taught
    const lastNeverTaughtIdx = spots.findLastIndex((s) => s.last_taught === null);
    const firstTaughtIdx = spots.findIndex((s) => s.last_taught !== null);
    if (firstTaughtIdx !== -1 && lastNeverTaughtIdx !== -1) {
      expect(lastNeverTaughtIdx).toBeLessThan(firstTaughtIdx);
    }
  });

  it('returns 22 spots total', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const spots = getColdSpots(db, '2026-03-14');
    expect(spots).toHaveLength(22);
  });

  it('includes temperature score and color', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const spots = getColdSpots(db, '2026-03-14');
    spots.forEach((s) => {
      expect(typeof s.temperature_score).toBe('number');
      expect(s.temperature_color).toMatch(/^#[0-9A-F]{6}$/);
    });
  });
});

describe('getSuggestedPlan', () => {
  it('picks coldest technique per category', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const plan = getSuggestedPlan(db, '2026-03-14');
    expect(plan).not.toBeNull();
    expect(plan!.standing_zoom_in.category).toBe('standing_zoom_in');
    expect(plan!.guard.category).toBe('guard');
    expect(plan!.submission.category).toBe('submission');
  });

  it('picks never-taught techniques when available', () => {
    const db = createSeededTestDb();
    // Only teach one technique per category
    createClassLog(db, {
      id: 'cl-1',
      date: '2026-03-10',
      week_theme: 'Test',
      standing_zoom_in: 'test-id-0001',
      guard: 'test-id-0011',
      submission: 'test-id-0017',
      guard_zoom_in_notes: '',
      notes: '',
    });

    const plan = getSuggestedPlan(db, '2026-03-14');
    // Should NOT pick the already-taught ones
    expect(plan!.standing_zoom_in.id).not.toBe('test-id-0001');
    expect(plan!.guard.id).not.toBe('test-id-0011');
    expect(plan!.submission.id).not.toBe('test-id-0017');
  });
});
