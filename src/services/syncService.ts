import {
  CloudDataSnapshot,
  SyncResult,
  FamilyBranch,
  Ancestor,
  Ritual,
  RitualReservation,
  FamilyMember,
  AppSettings,
  RitualTemplate,
} from '@/types';
import { authService } from './authService';

const getSnapshotKey = (userId: string) => `cloud_snapshot_${userId}`;
const getVersionKey = (userId: string) => `cloud_version_${userId}`;

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const validateAuth = (): { userId: string } | null => {
  const sessionStr = localStorage.getItem('cloud_session');
  if (!sessionStr) return null;
  try {
    const session = JSON.parse(sessionStr);
    if (!session.userId || !authService.getToken()) return null;
    return { userId: session.userId };
  } catch {
    return null;
  }
};

const getSnapshot = (userId: string): CloudDataSnapshot | null => {
  const data = localStorage.getItem(getSnapshotKey(userId));
  return data ? JSON.parse(data) : null;
};

const saveSnapshot = (snapshot: CloudDataSnapshot): void => {
  localStorage.setItem(getSnapshotKey(snapshot.userId), JSON.stringify(snapshot));
  localStorage.setItem(getVersionKey(snapshot.userId), String(snapshot.version));
};

const getNextVersion = (userId: string): number => {
  const versionStr = localStorage.getItem(getVersionKey(userId));
  return versionStr ? parseInt(versionStr) + 1 : 1;
};

export const syncService = {
  async uploadSnapshot(data: {
    branches: FamilyBranch[];
    ancestors: Ancestor[];
    rituals: Ritual[];
    reservations: RitualReservation[];
    members: FamilyMember[];
    templates: RitualTemplate[];
    settings: AppSettings;
  }): Promise<{ success: boolean; snapshot?: CloudDataSnapshot; error?: string }> {
    await delay(700);

    const auth = validateAuth();
    if (!auth) {
      return { success: false, error: '未登录，请先登录后再同步' };
    }

    try {
      const snapshot: CloudDataSnapshot = {
        userId: auth.userId,
        branches: data.branches,
        ancestors: data.ancestors,
        rituals: data.rituals,
        reservations: data.reservations,
        members: data.members,
        templates: data.templates,
        settings: data.settings,
        snapshotAt: new Date().toISOString(),
        version: getNextVersion(auth.userId),
      };

      saveSnapshot(snapshot);
      return { success: true, snapshot };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : '上传失败' };
    }
  },

  async downloadSnapshot(): Promise<{ success: boolean; snapshot?: CloudDataSnapshot; error?: string }> {
    await delay(500);

    const auth = validateAuth();
    if (!auth) {
      return { success: false, error: '未登录，请先登录后再同步' };
    }

    const snapshot = getSnapshot(auth.userId);
    if (!snapshot) {
      return { success: true, snapshot: undefined };
    }

    return { success: true, snapshot };
  },

  async sync(data: {
    branches: FamilyBranch[];
    ancestors: Ancestor[];
    rituals: Ritual[];
    reservations: RitualReservation[];
    members: FamilyMember[];
    templates: RitualTemplate[];
    settings: AppSettings;
  }): Promise<SyncResult> {
    await delay(1000);

    const auth = validateAuth();
    if (!auth) {
      return { success: false, error: '未登录，请先登录后再同步' };
    }

    try {
      const remoteSnapshot = getSnapshot(auth.userId);

      if (!remoteSnapshot) {
        const newSnapshot: CloudDataSnapshot = {
          userId: auth.userId,
          branches: data.branches,
          ancestors: data.ancestors,
          rituals: data.rituals,
          reservations: data.reservations,
          members: data.members,
          templates: data.templates,
          settings: data.settings,
          snapshotAt: new Date().toISOString(),
          version: getNextVersion(auth.userId),
        };
        saveSnapshot(newSnapshot);
        return {
          success: true,
          syncedAt: newSnapshot.snapshotAt,
          changesApplied: { local: 0, remote: data.branches.length + data.ancestors.length + data.rituals.length + data.reservations.length + data.members.length + data.templates.length },
        };
      }

      return {
        success: true,
        syncedAt: new Date().toISOString(),
        changesApplied: { local: 0, remote: 0 },
      };
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : '同步失败' };
    }
  },

  async forceUpload(data: {
    branches: FamilyBranch[];
    ancestors: Ancestor[];
    rituals: Ritual[];
    reservations: RitualReservation[];
    members: FamilyMember[];
    templates: RitualTemplate[];
    settings: AppSettings;
  }): Promise<{ success: boolean; snapshot?: CloudDataSnapshot; error?: string }> {
    return this.uploadSnapshot(data);
  },

  async forceDownload(): Promise<{ success: boolean; snapshot?: CloudDataSnapshot; error?: string }> {
    return this.downloadSnapshot();
  },

  async getRemoteVersion(): Promise<{ success: boolean; version?: number; snapshotAt?: string; error?: string }> {
    const auth = validateAuth();
    if (!auth) {
      return { success: false, error: '未登录' };
    }

    const snapshot = getSnapshot(auth.userId);
    if (!snapshot) {
      return { success: true, version: 0 };
    }

    return { success: true, version: snapshot.version, snapshotAt: snapshot.snapshotAt };
  },

  deleteRemoteData(): boolean {
    const auth = validateAuth();
    if (!auth) return false;
    localStorage.removeItem(getSnapshotKey(auth.userId));
    localStorage.removeItem(getVersionKey(auth.userId));
    return true;
  },
};
