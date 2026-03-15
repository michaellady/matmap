import { Database } from './interface';
import { Category, Technique } from '@/types';

export function getTechniquesByCategory(db: Database, category: Category): Technique[] {
  return db.all<Technique>(
    'SELECT * FROM technique WHERE category = ? AND deleted_at IS NULL ORDER BY name',
    [category]
  );
}

export function getTechniqueById(db: Database, id: string): Technique | undefined {
  return db.get<Technique>('SELECT * FROM technique WHERE id = ?', [id]);
}

export function getAllTechniques(db: Database): Technique[] {
  return db.all<Technique>(
    'SELECT * FROM technique WHERE deleted_at IS NULL ORDER BY category, name'
  );
}

export function createTechnique(
  db: Database,
  id: string,
  name: string,
  category: Category
): void {
  db.run('INSERT INTO technique (id, name, category) VALUES (?, ?, ?)', [id, name, category]);
}

export function updateTechnique(db: Database, id: string, name: string): void {
  db.run('UPDATE technique SET name = ? WHERE id = ?', [name, id]);
}

export function deleteTechnique(db: Database, id: string): void {
  db.run("UPDATE technique SET deleted_at = datetime('now') WHERE id = ?", [id]);
}

export function getTechniqueUsageCount(db: Database, id: string): number {
  const result = db.get<{ count: number }>(
    `SELECT COUNT(*) as count FROM class_log
     WHERE standing_zoom_in = ? OR guard = ? OR submission = ?`,
    [id, id, id]
  );
  return result?.count ?? 0;
}
