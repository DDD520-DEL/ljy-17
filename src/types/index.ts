export interface FamilyBranch {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Ancestor {
  id: string;
  name: string;
  relationship: string;
  birthDate: string;
  deathDate: string;
  photo?: string;
  photos?: string[];
  biography?: string;
  generation: number;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AlbumPhoto {
  url: string;
  sourceType: 'ancestor' | 'ritual';
  sourceId: string;
  sourceName: string;
  date: string;
  description?: string;
}

export interface Ritual {
  id: string;
  ancestorId: string;
  ancestorName?: string;
  date: string;
  location: string;
  participants: string[];
  offerings: string[];
  notes?: string;
  photos?: string[];
  branchId?: string;
  createdAt: string;
}

export interface RitualTemplate {
  id: string;
  name: string;
  description?: string;
  location: string;
  participants: string[];
  offerings: string[];
  notes?: string;
  ancestorId?: string;
  ancestorName?: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  birthDate?: string;
  generation: number;
  parentId?: string;
  spouseId?: string;
  phone?: string;
  avatar?: string;
  isAlive: boolean;
  gender: 'male' | 'female';
  branchId?: string;
  createdAt: string;
}

export interface ShareSettings {
  includeBirthDeathDates: boolean;
  includePhotos: boolean;
}

export interface AppSettings {
  reminderDays: number;
  theme: 'light' | 'dark';
  notificationEnabled: boolean;
  shareSettings: ShareSettings;
}

export interface RitualReservation {
  id: string;
  ancestorId: string;
  ancestorName: string;
  date: string;
  location: string;
  participants: string[];
  offerings: string[];
  notes?: string;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface ReminderItem {
  id: string;
  ancestorId: string;
  ancestorName: string;
  type: 'birth' | 'death' | 'reservation';
  date: string;
  daysLeft: number;
  dateStr: string;
  reservationId?: string;
  location?: string;
}

export interface TreeNode {
  id: string;
  name: string;
  gender: 'male' | 'female';
  relationship: string;
  isAlive: boolean;
  birthDate?: string;
  avatar?: string;
  generation: number;
  branchId?: string;
  children: TreeNode[];
  spouse?: TreeNode;
}

export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
  lastLoginAt: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  username: string;
  password: string;
}

export type SyncStatus = 'idle' | 'syncing' | 'success' | 'error' | 'conflict';

export interface SyncState {
  status: SyncStatus;
  lastSyncAt: string | null;
  lastSyncError: string | null;
  autoSyncEnabled: boolean;
  pendingChanges: number;
}

export type EntityType = 'branches' | 'ancestors' | 'rituals' | 'reservations' | 'members' | 'settings' | 'templates';

export interface ConflictItem {
  entityType: EntityType;
  entityId: string;
  localData: Record<string, unknown>;
  remoteData: Record<string, unknown>;
  localUpdatedAt: string;
  remoteUpdatedAt: string;
  fieldChanges: string[];
}

export type ConflictResolutionStrategy = 'useLocal' | 'useRemote' | 'merge';

export interface ConflictResolution {
  strategy: ConflictResolutionStrategy;
  resolutions?: Record<string, 'local' | 'remote'>;
}

export interface CloudDataSnapshot {
  userId: string;
  branches: FamilyBranch[];
  ancestors: Ancestor[];
  rituals: Ritual[];
  reservations: RitualReservation[];
  members: FamilyMember[];
  templates: RitualTemplate[];
  settings: AppSettings;
  snapshotAt: string;
  version: number;
}

export interface SyncResult {
  success: boolean;
  conflicts?: ConflictItem[];
  syncedAt?: string;
  error?: string;
  changesApplied?: {
    local: number;
    remote: number;
  };
}
