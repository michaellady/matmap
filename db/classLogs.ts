import { Database } from './interface';
import { ClassLogWithTechniques } from '@/types';

export interface CreateClassLogParams {
  id: string;
  date: string;
  week_theme: string;
  standing: string;
  guard: string;
  pinning: string | null;
  submission: string;
  notes: string;
}

export function createClassLog(db: Database, params: CreateClassLogParams): void {
  db.run(
    `INSERT INTO class_log (id, date, week_theme, standing, guard, pinning, submission, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      params.id,
      params.date,
      params.week_theme,
      params.standing,
      params.guard,
      params.pinning,
      params.submission,
      params.notes,
    ]
  );
}

export function getAllClassLogs(db: Database): ClassLogWithTechniques[] {
  return db.all<ClassLogWithTechniques>(
    `SELECT cl.*,
       t1.name as standing_name,
       t2.name as guard_name,
       t3.name as pinning_name,
       t4.name as submission_name
     FROM class_log cl
     JOIN technique t1 ON cl.standing = t1.id
     JOIN technique t2 ON cl.guard = t2.id
     LEFT JOIN technique t3 ON cl.pinning = t3.id
     JOIN technique t4 ON cl.submission = t4.id
     ORDER BY cl.date DESC`
  );
}

export function getClassLogById(db: Database, id: string): ClassLogWithTechniques | undefined {
  return db.get<ClassLogWithTechniques>(
    `SELECT cl.*,
       t1.name as standing_name,
       t2.name as guard_name,
       t3.name as pinning_name,
       t4.name as submission_name
     FROM class_log cl
     JOIN technique t1 ON cl.standing = t1.id
     JOIN technique t2 ON cl.guard = t2.id
     LEFT JOIN technique t3 ON cl.pinning = t3.id
     JOIN technique t4 ON cl.submission = t4.id
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
       date = ?, week_theme = ?, standing = ?, guard = ?,
       pinning = ?, submission = ?, notes = ?,
       updated_at = datetime('now')
     WHERE id = ?`,
    [
      params.date,
      params.week_theme,
      params.standing,
      params.guard,
      params.pinning,
      params.submission,
      params.notes,
      id,
    ]
  );
}

export function deleteClassLog(db: Database, id: string): void {
  db.run('DELETE FROM class_log WHERE id = ?', [id]);
}
