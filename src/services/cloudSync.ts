import {
  ConflictItem,
  ConflictResolution,
  ConflictResolutionStrategy,
  EntityType,
  FamilyBranch,
  Ancestor,
  Ritual,
  RitualReservation,
  FamilyMember,
  AppSettings,
  CloudDataSnapshot,
  RitualTemplate,
  FamilyEvent,
  OfferingItem,
  MemorialLocation,
  FamilyRule,
  MemorialArticle,
  RitualExpense,
} from '@/types';

type EntityWithTimestamp = { id: string; updatedAt?: string; createdAt?: string };

const ENTITY_TYPES: EntityType[] = ['branches', 'ancestors', 'rituals', 'events', 'reservations', 'members', 'templates', 'offerings', 'locations', 'rules', 'articles', 'expenses', 'settings'];

const UPDATE_TIME_FIELDS: Record<EntityType, string> = {
  branches: 'updatedAt',
  ancestors: 'updatedAt',
  rituals: 'createdAt',
  events: 'updatedAt',
  reservations: 'updatedAt',
  members: 'createdAt',
  templates: 'updatedAt',
  offerings: 'updatedAt',
  locations: 'updatedAt',
  rules: 'updatedAt',
  articles: 'updatedAt',
  expenses: 'updatedAt',
  settings: 'updatedAt',
};

const getEntityUpdatedAt = (entity: { [key: string]: unknown }, entityType: EntityType): string => {
  const field = UPDATE_TIME_FIELDS[entityType];
  return (entity?.[field] as string) || (entity?.createdAt as string) || new Date(0).toISOString();
};

const findEntityDifferences = (local: { [key: string]: unknown }, remote: { [key: string]: unknown }): string[] => {
  if (!local || !remote) return [];
  const changes: string[] = [];
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);
  const ignoredKeys = ['id', 'updatedAt', 'createdAt'];

  for (const key of allKeys) {
    if (ignoredKeys.includes(key)) continue;
    const localVal = JSON.stringify(local[key]);
    const remoteVal = JSON.stringify(remote[key]);
    if (localVal !== remoteVal) {
      changes.push(key);
    }
  }
  return changes;
};

export const conflictDetector = {
  detectConflicts(localData: LocalDataShape, remoteSnapshot: CloudDataSnapshot | undefined): ConflictItem[] {
    const conflicts: ConflictItem[] = [];
    if (!remoteSnapshot) return conflicts;

    for (const entityType of ENTITY_TYPES) {
      if (entityType === 'settings') {
        const localSettings = localData.settings as unknown as { [key: string]: unknown };
        const remoteSettings = remoteSnapshot.settings as unknown as { [key: string]: unknown };
        const fieldChanges = findEntityDifferences(localSettings, remoteSettings);
        if (fieldChanges.length > 0) {
          conflicts.push({
            entityType,
            entityId: 'settings',
            localData: localSettings,
            remoteData: remoteSettings,
            localUpdatedAt: new Date().toISOString(),
            remoteUpdatedAt: remoteSnapshot.snapshotAt,
            fieldChanges,
          });
        }
        continue;
      }

      const localEntities = (localData as unknown as Record<string, EntityWithTimestamp[]>)[entityType];
      const remoteEntities = (remoteSnapshot as unknown as Record<string, EntityWithTimestamp[]>)[entityType];

      const remoteMap = new Map(remoteEntities.map(e => [e.id, e]));

      for (const localEntity of localEntities) {
        const remoteEntity = remoteMap.get(localEntity.id);
        if (remoteEntity) {
          const localUpdatedAt = getEntityUpdatedAt(localEntity, entityType);
          const remoteUpdatedAt = getEntityUpdatedAt(remoteEntity, entityType);
          const fieldChanges = findEntityDifferences(localEntity, remoteEntity);

          if (fieldChanges.length > 0 && localUpdatedAt !== remoteUpdatedAt) {
            conflicts.push({
              entityType,
              entityId: localEntity.id,
              localData: localEntity,
              remoteData: remoteEntity,
              localUpdatedAt,
              remoteUpdatedAt,
              fieldChanges,
            });
          }
        }
      }
    }

    return conflicts;
  },
};

const mergeObjects = (
  local: { [key: string]: unknown },
  remote: { [key: string]: unknown },
  resolutions?: Record<string, 'local' | 'remote'>
): { [key: string]: unknown } => {
  if (!local) return { ...remote };
  if (!remote) return { ...local };

  const result: { [key: string]: unknown } = {};
  const allKeys = new Set([...Object.keys(local), ...Object.keys(remote)]);

  for (const key of allKeys) {
    const hasLocal = key in local;
    const hasRemote = key in remote;

    if (hasLocal && !hasRemote) {
      result[key] = local[key];
    } else if (hasRemote && !hasLocal) {
      result[key] = remote[key];
    } else {
      const choice = resolutions?.[key];
      if (choice === 'local') {
        result[key] = local[key];
      } else if (choice === 'remote') {
        result[key] = remote[key];
      } else {
        const localTime = new Date(getEntityUpdatedAt(local, 'branches' as EntityType)).getTime();
        const remoteTime = new Date(getEntityUpdatedAt(remote, 'branches' as EntityType)).getTime();
        result[key] = localTime >= remoteTime ? local[key] : remote[key];
      }
    }
  }

  return result;
};

export const conflictResolver = {
  resolveConflict(
    conflict: ConflictItem,
    resolution: ConflictResolution
  ): Record<string, unknown> {
    switch (resolution.strategy) {
      case 'useLocal':
        return { ...conflict.localData };

      case 'useRemote':
        return { ...conflict.remoteData };

      case 'merge':
      default:
        return mergeObjects(conflict.localData, conflict.remoteData, resolution.resolutions);
    }
  },

  resolveAllConflicts(
    conflicts: ConflictItem[],
    defaultStrategy: ConflictResolutionStrategy = 'merge',
    individualResolutions?: Map<string, ConflictResolution>
  ): Map<EntityType, Map<string, Record<string, unknown>>> {
    const resolved = new Map<EntityType, Map<string, Record<string, unknown>>>();

    for (const conflict of conflicts) {
      const resolution = individualResolutions?.get(`${conflict.entityType}_${conflict.entityId}`) || {
        strategy: defaultStrategy,
      };
      const resolvedEntity = this.resolveConflict(conflict, resolution);

      if (!resolved.has(conflict.entityType)) {
        resolved.set(conflict.entityType, new Map());
      }
      resolved.get(conflict.entityType)!.set(conflict.entityId, resolvedEntity);
    }

    return resolved;
  },
};

type LocalDataShape = {
  branches: FamilyBranch[];
  ancestors: Ancestor[];
  rituals: Ritual[];
  events: FamilyEvent[];
  reservations: RitualReservation[];
  members: FamilyMember[];
  templates: RitualTemplate[];
  offerings: OfferingItem[];
  locations: MemorialLocation[];
  rules: FamilyRule[];
  articles: MemorialArticle[];
  expenses: RitualExpense[];
  settings: AppSettings;
};

export const mergeEngine = {
  mergeLocalAndRemote(
    localData: LocalDataShape,
    remoteSnapshot: CloudDataSnapshot | undefined,
    resolvedConflicts: Map<EntityType, Map<string, Record<string, unknown>>>
  ): LocalDataShape & {
    stats: { addedFromRemote: number; updated: number; removed: number };
  } {
    const stats = { addedFromRemote: 0, updated: 0, removed: 0 };

    if (!remoteSnapshot) {
      return { ...localData, stats };
    }

    const result: Partial<LocalDataShape> = {};

    for (const entityType of ENTITY_TYPES) {
      if (entityType === 'settings') {
        const resolvedSettings = resolvedConflicts.get('settings')?.get('settings');
        const localSettings = localData.settings as unknown as { [key: string]: unknown };
        const remoteSettings = remoteSnapshot.settings as unknown as { [key: string]: unknown };
        result.settings = (resolvedSettings || mergeObjects(localSettings, remoteSettings)) as unknown as AppSettings;
        continue;
      }

      const localEntities = (localData as unknown as Record<string, EntityWithTimestamp[]>)[entityType];
      const remoteEntities = (remoteSnapshot as unknown as Record<string, EntityWithTimestamp[]>)[entityType];
      const resolvedForType = resolvedConflicts.get(entityType);

      const localMap = new Map(localEntities.map(e => [e.id, { ...e }]));
      const remoteMap = new Map(remoteEntities.map(e => [e.id, { ...e }]));
      const resultMap = new Map<string, { [key: string]: unknown }>();

      for (const [id, entity] of localMap) {
        resultMap.set(id, entity as { [key: string]: unknown });
      }

      for (const [id, remoteEntity] of remoteMap) {
        if (!localMap.has(id)) {
          resultMap.set(id, remoteEntity as { [key: string]: unknown });
          stats.addedFromRemote++;
        } else {
          const localEntity = localMap.get(id)!;
          const resolvedEntity = resolvedForType?.get(id);
          if (resolvedEntity) {
            resultMap.set(id, resolvedEntity);
            stats.updated++;
          } else {
            const localTime = new Date(getEntityUpdatedAt(localEntity, entityType)).getTime();
            const remoteTime = new Date(getEntityUpdatedAt(remoteEntity, entityType)).getTime();
            if (remoteTime > localTime) {
              resultMap.set(id, remoteEntity as { [key: string]: unknown });
              stats.updated++;
            }
          }
        }
      }

      (result as unknown as Record<string, unknown[]>)[entityType] = Array.from(resultMap.values());
    }

    return { ...(result as LocalDataShape), stats };
  },
};

export const syncOrchestrator = {
  async performSync(
    localData: LocalDataShape,
    onConflict?: (conflicts: ConflictItem[]) => Promise<Map<string, ConflictResolution> | null>
  ): Promise<{
    success: boolean;
    mergedData?: LocalDataShape;
    conflicts?: ConflictItem[];
    error?: string;
    stats?: { addedFromRemote: number; updated: number; removed: number };
  }> {
    try {
      const { syncService } = await import('./syncService');
      const downloadResult = await syncService.downloadSnapshot();

      if (!downloadResult.success) {
        return { success: false, error: downloadResult.error };
      }

      const conflicts = conflictDetector.detectConflicts(localData, downloadResult.snapshot);

      if (conflicts.length > 0 && onConflict) {
        const resolutions = await onConflict(conflicts);
        if (resolutions === null) {
          return { success: false, conflicts, error: '用户取消了冲突解决' };
        }

        const resolvedMap = conflictResolver.resolveAllConflicts(conflicts, 'merge', resolutions);
        const { stats, ...mergedData } = mergeEngine.mergeLocalAndRemote(
          localData,
          downloadResult.snapshot,
          resolvedMap
        );

        return { success: true, mergedData, conflicts, stats };
      }

      const { stats, ...mergedData } = mergeEngine.mergeLocalAndRemote(
        localData,
        downloadResult.snapshot,
        new Map()
      );

      return { success: true, mergedData, stats };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : '同步失败' };
    }
  },
};
