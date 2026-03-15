import { createSeededTestDb } from '../helpers/testDb';
import {
  createClassLog,
  getAllClassLogs,
  getClassLogById,
  updateClassLog,
  deleteClassLog,
} from '../../db/classLogs';

describe('classLogs', () => {
  function seedClassLog(db: ReturnType<typeof createSeededTestDb>) {
    createClassLog(db, {
      id: 'cl-1',
      date: '2026-03-10',
      week_theme: 'Front headlock week',
      standing_zoom_in: 'test-id-0001',
      guard: 'test-id-0011',
      submission: 'test-id-0017',
      guard_zoom_in_notes: 'Focus on underhook recovery',
      notes: 'Good class, 12 students',
    });
  }

  it('creates and reads back a class log', () => {
    const db = createSeededTestDb();
    seedClassLog(db);

    const log = getClassLogById(db, 'cl-1');
    expect(log).toBeDefined();
    expect(log!.id).toBe('cl-1');
    expect(log!.date).toBe('2026-03-10');
    expect(log!.week_theme).toBe('Front headlock week');
    expect(log!.standing_zoom_in).toBe('test-id-0001');
    expect(log!.guard).toBe('test-id-0011');
    expect(log!.submission).toBe('test-id-0017');
    expect(log!.guard_zoom_in_notes).toBe('Focus on underhook recovery');
    expect(log!.notes).toBe('Good class, 12 students');
  });

  it('includes technique names in class log', () => {
    const db = createSeededTestDb();
    seedClassLog(db);

    const log = getClassLogById(db, 'cl-1');
    expect(log!.standing_zoom_in_name).toBeDefined();
    expect(log!.guard_name).toBeDefined();
    expect(log!.submission_name).toBeDefined();
  });

  it('lists all class logs ordered by date desc', () => {
    const db = createSeededTestDb();
    seedClassLog(db);
    createClassLog(db, {
      id: 'cl-2',
      date: '2026-03-12',
      week_theme: 'Takedown week',
      standing_zoom_in: 'test-id-0004',
      guard: 'test-id-0012',
      submission: 'test-id-0018',
      guard_zoom_in_notes: '',
      notes: '',
    });

    const logs = getAllClassLogs(db);
    expect(logs).toHaveLength(2);
    expect(logs[0].date).toBe('2026-03-12');
    expect(logs[1].date).toBe('2026-03-10');
  });

  it('updates a class log', () => {
    const db = createSeededTestDb();
    seedClassLog(db);

    updateClassLog(db, 'cl-1', {
      date: '2026-03-11',
      week_theme: 'Updated theme',
      standing_zoom_in: 'test-id-0002',
      guard: 'test-id-0011',
      submission: 'test-id-0017',
      guard_zoom_in_notes: 'Updated notes',
      notes: 'Updated general notes',
    });

    const log = getClassLogById(db, 'cl-1');
    expect(log!.date).toBe('2026-03-11');
    expect(log!.week_theme).toBe('Updated theme');
    expect(log!.standing_zoom_in).toBe('test-id-0002');
    expect(log!.guard_zoom_in_notes).toBe('Updated notes');
  });

  it('deletes a class log', () => {
    const db = createSeededTestDb();
    seedClassLog(db);

    deleteClassLog(db, 'cl-1');
    const log = getClassLogById(db, 'cl-1');
    expect(log).toBeUndefined();
    expect(getAllClassLogs(db)).toHaveLength(0);
  });
});
