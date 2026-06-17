import { useState, useMemo } from 'react';
import {
  AlertTriangle,
  X,
  ChevronRight,
  ChevronDown,
  Check,
  RefreshCw,
  Laptop,
  Cloud,
  GitMerge,
} from 'lucide-react';
import { ConflictItem, ConflictResolution, ConflictResolutionStrategy, EntityType } from '@/types';

interface Props {
  conflicts: ConflictItem[];
  onResolve: (resolutions: Map<string, ConflictResolution>) => Promise<void>;
  onDismiss: () => void;
  isResolving: boolean;
}

const ENTITY_NAMES: Record<EntityType, string> = {
  branches: '家族分支',
  ancestors: '先人信息',
  rituals: '祭祀记录',
  events: '家族大事记',
  reservations: '祭祀预约',
  members: '家族成员',
  templates: '祭祀模板',
  settings: '系统设置',
  offerings: '供品库存',
};

export default function ConflictResolverDialog({
  conflicts,
  onResolve,
  onDismiss,
  isResolving,
}: Props) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [globalStrategy, setGlobalStrategy] = useState<ConflictResolutionStrategy>('merge');
  const [fieldChoices, setFieldChoices] = useState<Map<string, Record<string, 'local' | 'remote'>>>(
    new Map()
  );

  const toggleExpand = (conflictId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev);
      if (next.has(conflictId)) {
        next.delete(conflictId);
      } else {
        next.add(conflictId);
      }
      return next;
    });
  };

  const applyGlobalStrategy = (strategy: ConflictResolutionStrategy) => {
    setGlobalStrategy(strategy);
  };

  const setFieldChoice = (conflictKey: string, field: string, choice: 'local' | 'remote') => {
    setFieldChoices(prev => {
      const next = new Map(prev);
      const current = next.get(conflictKey) || {};
      next.set(conflictKey, { ...current, [field]: choice });
      return next;
    });
    setGlobalStrategy('merge');
  };

  const buildResolutions = (): Map<string, ConflictResolution> => {
    const map = new Map<string, ConflictResolution>();
    for (const conflict of conflicts) {
      const key = `${conflict.entityType}_${conflict.entityId}`;
      const fieldRes = fieldChoices.get(key);
      if (globalStrategy === 'merge' && fieldRes && Object.keys(fieldRes).length > 0) {
        map.set(key, { strategy: 'merge', resolutions: fieldRes });
      } else {
        map.set(key, { strategy: globalStrategy });
      }
    }
    return map;
  };

  const handleResolve = async () => {
    const resolutions = buildResolutions();
    await onResolve(resolutions);
  };

  const groupedConflicts = useMemo(() => {
    const grouped = new Map<EntityType, ConflictItem[]>();
    for (const c of conflicts) {
      if (!grouped.has(c.entityType)) {
        grouped.set(c.entityType, []);
      }
      grouped.get(c.entityType)!.push(c);
    }
    return grouped;
  }, [conflicts]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleString('zh-CN', {
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderFieldDiff = (
    conflict: ConflictItem,
    field: string,
    conflictKey: string
  ) => {
    const localVal = JSON.stringify(conflict.localData?.[field]);
    const remoteVal = JSON.stringify(conflict.remoteData?.[field]);
    const choice = fieldChoices.get(conflictKey)?.[field];

    const displayVal = (val: string) => {
      if (val === undefined || val === 'undefined' || val === 'null') return '（空）';
      const clean = val.replace(/^"|"$/g, '');
      return clean.length > 40 ? clean.substring(0, 40) + '...' : clean;
    };

    return (
      <div key={field} className="space-y-2">
        <div className="text-xs font-medium text-brown-600">{field}</div>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setFieldChoice(conflictKey, field, 'local')}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              choice === 'local'
                ? 'border-blue-500 bg-blue-50'
                : 'border-brown-100 bg-cream-50 hover:border-blue-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-blue-600 mb-1.5">
              <Laptop className="w-3 h-3" />
              本地版本
            </div>
            <div className="text-sm text-brown-700 break-all">{displayVal(localVal)}</div>
            {choice === 'local' && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-blue-600">
                <Check className="w-3 h-3" />
                已选择
              </div>
            )}
          </button>
          <button
            type="button"
            onClick={() => setFieldChoice(conflictKey, field, 'remote')}
            className={`p-3 rounded-xl border-2 text-left transition-all ${
              choice === 'remote'
                ? 'border-purple-500 bg-purple-50'
                : 'border-brown-100 bg-cream-50 hover:border-purple-300'
            }`}
          >
            <div className="flex items-center gap-1.5 text-xs text-purple-600 mb-1.5">
              <Cloud className="w-3 h-3" />
              云端版本
            </div>
            <div className="text-sm text-brown-700 break-all">{displayVal(remoteVal)}</div>
            {choice === 'remote' && (
              <div className="mt-1.5 flex items-center gap-1 text-xs text-purple-600">
                <Check className="w-3 h-3" />
                已选择
              </div>
            )}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col animate-fade-in shadow-2xl">
        <div className="p-6 border-b border-brown-100 flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-2xl flex-shrink-0">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-serif font-bold text-brown-800 mb-1">
              检测到数据冲突
            </h3>
            <p className="text-sm text-brown-500">
              本地数据与云端数据存在 {conflicts.length} 处差异，请选择如何合并
            </p>
          </div>
          <button
            onClick={onDismiss}
            className="p-2 hover:bg-brown-100 rounded-xl transition-colors flex-shrink-0"
          >
            <X className="w-5 h-5 text-brown-500" />
          </button>
        </div>

        <div className="p-4 bg-cream-50 border-b border-brown-100">
          <div className="text-xs font-medium text-brown-600 mb-2">一键应用策略：</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => applyGlobalStrategy('useLocal')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                globalStrategy === 'useLocal'
                  ? 'bg-blue-500 text-white shadow-sm'
                  : 'bg-white text-blue-600 border border-blue-200 hover:bg-blue-50'
              }`}
            >
              <Laptop className="w-4 h-4" />
              全部使用本地
            </button>
            <button
              onClick={() => applyGlobalStrategy('useRemote')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                globalStrategy === 'useRemote'
                  ? 'bg-purple-500 text-white shadow-sm'
                  : 'bg-white text-purple-600 border border-purple-200 hover:bg-purple-50'
              }`}
            >
              <Cloud className="w-4 h-4" />
              全部使用云端
            </button>
            <button
              onClick={() => applyGlobalStrategy('merge')}
              className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1.5 transition-all ${
                globalStrategy === 'merge'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50'
              }`}
            >
              <GitMerge className="w-4 h-4" />
              智能合并
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {Array.from(groupedConflicts.entries()).map(([entityType, items]) => (
            <div key={entityType} className="space-y-2">
              <div className="text-xs font-semibold text-brown-500 px-2">
                {ENTITY_NAMES[entityType]}（{items.length}项）
              </div>
              {items.map(conflict => {
                const conflictKey = `${conflict.entityType}_${conflict.entityId}`;
                const isExpanded = expandedIds.has(conflictKey);
                const entityName =
                  (conflict.localData?.name as string) ||
                  (conflict.remoteData?.name as string) ||
                  conflict.entityId.substring(0, 12) + '...';

                return (
                  <div
                    key={conflictKey}
                    className="border border-brown-100 rounded-xl overflow-hidden bg-white"
                  >
                    <button
                      onClick={() => toggleExpand(conflictKey)}
                      className="w-full p-4 flex items-center gap-3 hover:bg-cream-50 transition-colors text-left"
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-brown-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-brown-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-brown-800 truncate">
                          {entityName}
                        </div>
                        <div className="text-xs text-brown-400 mt-0.5 flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Laptop className="w-3 h-3" />
                            {formatDate(conflict.localUpdatedAt)}
                          </span>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Cloud className="w-3 h-3" />
                            {formatDate(conflict.remoteUpdatedAt)}
                          </span>
                        </div>
                      </div>
                      <div className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-medium rounded-lg">
                        {conflict.fieldChanges.length}处差异
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-brown-100 p-4 space-y-4 bg-cream-50/50">
                        {conflict.fieldChanges.map(field =>
                          renderFieldDiff(conflict, field, conflictKey)
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-brown-100 bg-white">
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onDismiss}
              disabled={isResolving}
              className="btn-secondary disabled:opacity-50"
            >
              稍后处理
            </button>
            <button
              onClick={handleResolve}
              disabled={isResolving}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {isResolving ? (
                <>
                  <RefreshCw className="w-5 h-5 animate-spin" />
                  解决中...
                </>
              ) : (
                <>
                  <GitMerge className="w-5 h-5" />
                  确认并同步
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
