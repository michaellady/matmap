import { useCallback, useEffect, useState } from 'react';
import { ClassLogWithTechniques } from '@/types';
import { useDatabase } from './useDatabase';
import * as classLogDb from '@/db/classLogs';

export function useClassLogs() {
  const { db, dataVersion } = useDatabase();
  const [classLogs, setClassLogs] = useState<ClassLogWithTechniques[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    if (!db) return;
    setLoading(true);
    setClassLogs(classLogDb.getAllClassLogs(db));
    setLoading(false);
  }, [db, dataVersion]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { classLogs, loading, refresh };
}

export function useClassLog(id: string | undefined) {
  const { db, dataVersion } = useDatabase();
  const [classLog, setClassLog] = useState<ClassLogWithTechniques | undefined>();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db || !id) return;
    setLoading(true);
    setClassLog(classLogDb.getClassLogById(db, id));
    setLoading(false);
  }, [db, id, dataVersion]);

  return { classLog, loading };
}
