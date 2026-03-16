import { createSeededTestDb } from '../helpers/testDb';
import { createClassLog } from '../../db/classLogs';
import {
  getTechniqueTemperatures,
  getWeeklyFrequency,
  getColdSpots,
  getSuggestedPlan,
} from '../../db/heatmap';

function insertTestClasses(db: ReturnType<typeof createSeededTestDb>) {
  createClassLog(db, {
    id: 'cl-1', date: '2026-03-10', week_theme: '',
    standing: 'test-id-0001', guard: 'test-id-0011', pinning: null,
    submission: 'test-id-0017', guard_notes: '', notes: '',
  });
  createClassLog(db, {
    id: 'cl-2', date: '2026-03-05', week_theme: '',
    standing: 'test-id-0001', guard: 'test-id-0012', pinning: null,
    submission: 'test-id-0018', guard_notes: '', notes: '',
  });
  createClassLog(db, {
    id: 'cl-3', date: '2026-02-15', week_theme: '',
    standing: 'test-id-0004', guard: 'test-id-0011', pinning: null,
    submission: 'test-id-0019', guard_notes: '', notes: '',
  });
}

describe('getTechniqueTemperatures', () => {
  it('returns temperatures for all techniques', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const temps = getTechniqueTemperatures(db, undefined, '2026-03-14');
    expect(temps).toHaveLength(26);
  });

  it('returns temperatures filtered by category', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const temps = getTechniqueTemperatures(db, 'guard', '2026-03-14');
    expect(temps).toHaveLength(7);
    temps.forEach((t) => expect(t.category).toBe('guard'));
  });

  it('computes correct frequency and recency for taught technique', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const temps = getTechniqueTemperatures(db, 'standing', '2026-03-14');
    const t = temps.find((t) => t.id === 'test-id-0001');
    expect(t).toBeDefined();
    expect(t!.frequency_8wk).toBe(2);
    expect(t!.days_since).toBe(4);
    expect(t!.last_taught).toBe('2026-03-10');
  });

  it('returns null days_since for never-taught technique', () => {
    const db = createSeededTestDb();
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
    const ids = new Set(freq.map((f) => `${f.technique_id}-${f.week_start}`));
    expect(ids.size).toBe(freq.length);
  });
});

describe('getColdSpots', () => {
  it('returns never-taught techniques first', () => {
    const db = createSeededTestDb();
    insertTestClasses(db);
    const spots = getColdSpots(db, '2026-03-14');
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
    expect(spots).toHaveLength(26);
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
    expect(plan!.standing.category).toBe('standing');
    expect(plan!.guard.category).toBe('guard');
    expect(plan!.submission.category).toBe('submission');
    expect(plan!.pinning).not.toBeNull();
    expect(plan!.pinning!.category).toBe('pinning');
  });

  it('picks never-taught techniques when available', () => {
    const db = createSeededTestDb();
    createClassLog(db, {
      id: 'cl-1', date: '2026-03-10', week_theme: '',
      standing: 'test-id-0001', guard: 'test-id-0011', pinning: null,
      submission: 'test-id-0017', guard_notes: '', notes: '',
    });

    const plan = getSuggestedPlan(db, '2026-03-14');
    expect(plan!.standing.id).not.toBe('test-id-0001');
    expect(plan!.guard.id).not.toBe('test-id-0011');
    expect(plan!.submission.id).not.toBe('test-id-0017');
  });
});
