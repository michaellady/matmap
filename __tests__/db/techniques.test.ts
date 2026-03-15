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
  it('returns 10 standing_zoom_in techniques', () => {
    const db = createSeededTestDb();
    const techniques = getTechniquesByCategory(db, 'standing_zoom_in');
    expect(techniques).toHaveLength(10);
    techniques.forEach((t) => expect(t.category).toBe('standing_zoom_in'));
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

  it('returns a technique by ID', () => {
    const db = createSeededTestDb();
    const technique = getTechniqueById(db, 'test-id-0001');
    expect(technique).toBeDefined();
    expect(technique!.category).toBe('standing_zoom_in');
  });

  it('returns all active techniques', () => {
    const db = createSeededTestDb();
    const all = getAllTechniques(db);
    expect(all).toHaveLength(22);
  });

  it('creates a new technique', () => {
    const db = createSeededTestDb();
    createTechnique(db, 'new-id', 'Ankle Pick', 'standing_zoom_in');
    const t = getTechniqueById(db, 'new-id');
    expect(t).toBeDefined();
    expect(t!.name).toBe('Ankle Pick');
    expect(t!.category).toBe('standing_zoom_in');
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
    expect(all).toHaveLength(21);
    // But still findable by ID
    const t = getTechniqueById(db, 'test-id-0001');
    expect(t).toBeDefined();
    expect(t!.deleted_at).not.toBeNull();
  });

  it('gets usage count for a technique', () => {
    const db = createSeededTestDb();
    // No usage initially
    expect(getTechniqueUsageCount(db, 'test-id-0001')).toBe(0);

    // Create a class log using the technique
    createClassLog(db, {
      id: 'cl-1',
      date: '2026-03-01',
      week_theme: 'Test',
      standing_zoom_in: 'test-id-0001',
      guard: 'test-id-0011',
      submission: 'test-id-0017',
      guard_zoom_in_notes: '',
      notes: '',
    });

    expect(getTechniqueUsageCount(db, 'test-id-0001')).toBe(1);
  });
});
