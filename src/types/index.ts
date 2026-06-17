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

export interface OfferingItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  description?: string;
  lastPurchasedDate?: string;
  expiryDate?: string;
  lowStockThreshold?: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  reminderDays: number;
  theme: 'light' | 'dark';
  notificationEnabled: boolean;
  shareSettings: ShareSettings;
  lowStockThreshold: number;
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

export type FamilyEventType = 'wedding' | 'birth' | 'move' | 'birthday' | 'promotion' | 'graduation' | 'travel' | 'other';

export interface FamilyEvent {
  id: string;
  type: FamilyEventType;
  title: string;
  date: string;
  description?: string;
  participants: string[];
  photos?: string[];
  location?: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export const FAMILY_EVENT_TYPE_META: Record<FamilyEventType, { label: string; icon: string; color: string; bgColor: string }> = {
  wedding: { label: '婚礼', icon: '💍', color: 'text-pink-600', bgColor: 'bg-pink-50' },
  birth: { label: '添丁', icon: '👶', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  move: { label: '乔迁', icon: '🏠', color: 'text-emerald-600', bgColor: 'bg-emerald-50' },
  birthday: { label: '寿辰', icon: '🎂', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  promotion: { label: '晋升', icon: '🎖️', color: 'text-purple-600', bgColor: 'bg-purple-50' },
  graduation: { label: '学业', icon: '🎓', color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  travel: { label: '旅行', icon: '✈️', color: 'text-cyan-600', bgColor: 'bg-cyan-50' },
  other: { label: '其他', icon: '📌', color: 'text-gray-600', bgColor: 'bg-gray-50' },
};

export interface MemorialLocation {
  id: string;
  name: string;
  address: string;
  ancestorIds: string[];
  photos?: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface FamilyRule {
  id: string;
  title: string;
  content: string;
  sourceAncestor?: string;
  sortOrder: number;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MemorialArticle {
  id: string;
  ancestorId: string;
  ancestorName?: string;
  title: string;
  content: string;
  date: string;
  author?: string;
  branchId?: string;
  createdAt: string;
  updatedAt: string;
}

export type EntityType = 'branches' | 'ancestors' | 'rituals' | 'reservations' | 'members' | 'settings' | 'templates' | 'events' | 'offerings' | 'locations' | 'rules' | 'articles';

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
  events: FamilyEvent[];
  reservations: RitualReservation[];
  members: FamilyMember[];
  templates: RitualTemplate[];
  offerings: OfferingItem[];
  locations: MemorialLocation[];
  rules: FamilyRule[];
  articles: MemorialArticle[];
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
