import { createSeededTestDb } from '../helpers/testDb';
import {
  getTechniquesByCategory,
  getTechniqueById,
  getAllTechniques,
  createTechnique,
  updateTechnique,
  deleteTechnique,
  getTechniqueUsageCount,
} from '../../db/techniques';
import { createClassLog } from '../../db/classLogs';

describe('techniques', () => {
  it('returns 10 standing techniques', () => {
    const db = createSeededTestDb();
    const techniques = getTechniquesByCategory(db, 'standing');
    expect(techniques).toHaveLength(10);
    techniques.forEach((t) => expect(t.category).toBe('standing'));
  });

  it('returns 6 guard techniques', () => {
    const db = createSeededTestDb();
    const techniques = getTechniquesByCategory(db, 'guard');
    expect(techniques).toHaveLength(6);
    techniques.forEach((t) => expect(t.category).toBe('guard'));
  });

  it('returns 6 submission techniques', () => {
    const db = createSeededTestDb();
    const techniques = getTechniquesByCategory(db, 'submission');
    expect(techniques).toHaveLength(6);
    techniques.forEach((t) => expect(t.category).toBe('submission'));
  });

  it('returns 3 pinning techniques', () => {
    const db = createSeededTestDb();
    const techniques = getTechniquesByCategory(db, 'pinning');
    expect(techniques).toHaveLength(3);
    techniques.forEach((t) => expect(t.category).toBe('pinning'));
  });

  it('returns a technique by ID', () => {
    const db = createSeededTestDb();
    const technique = getTechniqueById(db, 'test-id-0001');
    expect(technique).toBeDefined();
    expect(technique!.category).toBe('standing');
  });

  it('returns all active techniques', () => {
    const db = createSeededTestDb();
    const all = getAllTechniques(db);
    expect(all).toHaveLength(25);
  });

  it('creates a new technique', () => {
    const db = createSeededTestDb();
    createTechnique(db, 'new-id', 'Side control → mount', 'pinning');
    const t = getTechniqueById(db, 'new-id');
    expect(t).toBeDefined();
    expect(t!.name).toBe('Side control → mount');
    expect(t!.category).toBe('pinning');
  });

  it('updates a technique name', () => {
    const db = createSeededTestDb();
    updateTechnique(db, 'test-id-0001', 'Updated Name');
    const t = getTechniqueById(db, 'test-id-0001');
    expect(t!.name).toBe('Updated Name');
  });

  it('soft-deletes a technique', () => {
    const db = createSeededTestDb();
    deleteTechnique(db, 'test-id-0001');
    const all = getAllTechniques(db);
    expect(all).toHaveLength(24);
    const t = getTechniqueById(db, 'test-id-0001');
    expect(t).toBeDefined();
    expect(t!.deleted_at).not.toBeNull();
  });

  it('gets usage count for a technique', () => {
    const db = createSeededTestDb();
    expect(getTechniqueUsageCount(db, 'test-id-0001')).toBe(0);

    createClassLog(db, {
      id: 'cl-1',
      date: '2026-03-01',
      week_theme: '',
      standing: 'test-id-0001',
      guard: 'test-id-0011',
      pinning: null,
      submission: 'test-id-0017',
      guard_notes: '',
      notes: '',
    });

    expect(getTechniqueUsageCount(db, 'test-id-0001')).toBe(1);
  });
});
