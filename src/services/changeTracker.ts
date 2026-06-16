import { EntityType } from '@/types';

const CHANGE_LOG_KEY = 'local_change_log';

interface ChangeRecord {
  entityType: EntityType;
  entityId: string;
  operation: 'create' | 'update' | 'delete';
  timestamp: string;
}

const getChangeLog = (): ChangeRecord[] => {
  const data = localStorage.getItem(CHANGE_LOG_KEY);
  return data ? JSON.parse(data) : [];
};

const saveChangeLog = (log: ChangeRecord[]): void => {
  localStorage.setItem(CHANGE_LOG_KEY, JSON.stringify(log));
};

export const changeTracker = {
  recordChange(entityType: EntityType, entityId: string, operation: 'create' | 'update' | 'delete'): void {
    const log = getChangeLog();
    log.push({
      entityType,
      entityId,
      operation,
      timestamp: new Date().toISOString(),
    });
    saveChangeLog(log);
  },

  getPendingCount(): number {
    return getChangeLog().length;
  },

  getChanges(): ChangeRecord[] {
    return getChangeLog();
  },

  clearChanges(): void {
    saveChangeLog([]);
  },

  clearChangesForEntity(entityType: EntityType, entityId: string): void {
    const log = getChangeLog().filter(
      c => !(c.entityType === entityType && c.entityId === entityId)
    );
    saveChangeLog(log);
  },
};
