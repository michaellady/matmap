import { Database } from './interface';
import { ClassLog, ClassLogWithTechniques } from '@/types';

export interface CreateClassLogParams {
  id: string;
  date: string;
  week_theme: string;
  standing_zoom_in: string;
  guard: string;
  submission: string;
  guard_zoom_in_notes: string;
  notes: string;
}

export function createClassLog(db: Database, params: CreateClassLogParams): void {
  db.run(
    `INSERT INTO class_log (id, date, week_theme, standing_zoom_in, guard, submission, guard_zoom_in_notes, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.id,
      params.date,
      params.week_theme,
      params.standing_zoom_in,
      params.guard,
      params.submission,
      params.guard_zoom_in_notes,
      params.notes,
    ]
  );
}

export function getAllClassLogs(db: Database): ClassLogWithTechniques[] {
  return db.all<ClassLogWithTechniques>(
    `SELECT cl.*,
       t1.name as standing_zoom_in_name,
       t2.name as guard_name,
       t3.name as submission_name
     FROM class_log cl
     JOIN technique t1 ON cl.standing_zoom_in = t1.id
     JOIN technique t2 ON cl.guard = t2.id
     JOIN technique t3 ON cl.submission = t3.id
     ORDER BY cl.date DESC`
  );
}

export function getClassLogById(db: Database, id: string): ClassLogWithTechniques | undefined {
  return db.get<ClassLogWithTechniques>(
    `SELECT cl.*,
       t1.name as standing_zoom_in_name,
       t2.name as guard_name,
       t3.name as submission_name
     FROM class_log cl
     JOIN technique t1 ON cl.standing_zoom_in = t1.id
     JOIN technique t2 ON cl.guard = t2.id
     JOIN technique t3 ON cl.submission = t3.id
     WHERE cl.id = ?`,
    [id]
  );
}

export function updateClassLog(
  db: Database,
  id: string,
  params: Omit<CreateClassLogParams, 'id'>
): void {
  db.run(
    `UPDATE class_log SET
       date = ?, week_theme = ?, standing_zoom_in = ?, guard = ?,
       submission = ?, guard_zoom_in_notes = ?, notes = ?,
       updated_at = datetime('now')
     WHERE id = ?`,
    [
      params.date,
      params.week_theme,
      params.standing_zoom_in,
      params.guard,
      params.submission,
      params.guard_zoom_in_notes,
      params.notes,
      id,
    ]
  );
}

export function deleteClassLog(db: Database, id: string): void {
  db.run('DELETE FROM class_log WHERE id = ?', [id]);
}
