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

export type ContactExportFormat = 'vcard' | 'csv' | 'print';
export type ContactExportScope = 'all' | 'alive';

export interface ContactExportOptions {
  format: ContactExportFormat;
  scope: ContactExportScope;
  includeBranch: boolean;
  includeGeneration: boolean;
  includeBirthDate: boolean;
}

export interface ShareSettings {
  includeBirthDeathDates: boolean;
  includePhotos: boolean;
}

export interface ContactExportSettings {
  defaultScope: ContactExportScope;
  defaultFormat: ContactExportFormat;
  includeBranch: boolean;
  includeGeneration: boolean;
  includeBirthDate: boolean;
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

export const OFFERING_WIKI_CATEGORIES = [
  '三牲',
  '五果',
  '酒水茶',
  '香烛',
  '纸扎祭品',
  '糕点糖果',
  '鲜花',
  '其他',
] as const;

export type OfferingWikiCategory = (typeof OFFERING_WIKI_CATEGORIES)[number];

export const OFFERING_WIKI_CATEGORY_META: Record<
  OfferingWikiCategory,
  { label: string; icon: string; color: string; bgColor: string }
> = {
  三牲: { label: '三牲', icon: '🍖', color: 'text-red-700', bgColor: 'bg-red-50' },
  五果: { label: '五果', icon: '🍎', color: 'text-green-700', bgColor: 'bg-green-50' },
  酒水茶: { label: '酒水茶', icon: '🍶', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  香烛: { label: '香烛', icon: '🕯️', color: 'text-orange-700', bgColor: 'bg-orange-50' },
  纸扎祭品: { label: '纸扎祭品', icon: '🪔', color: 'text-yellow-700', bgColor: 'bg-yellow-50' },
  糕点糖果: { label: '糕点糖果', icon: '🥮', color: 'text-pink-700', bgColor: 'bg-pink-50' },
  鲜花: { label: '鲜花', icon: '🌼', color: 'text-purple-700', bgColor: 'bg-purple-50' },
  其他: { label: '其他', icon: '📦', color: 'text-gray-700', bgColor: 'bg-gray-50' },
};

export const OFFERING_OCCASIONS = [
  '清明',
  '忌日',
  '中元节',
  '春节',
  '冬至',
  '周年',
  '诞辰',
  '寒衣节',
  '重阳节',
  '日常祭拜',
] as const;

export interface OfferingWiki {
  id: string;
  name: string;
  category: string;
  image?: string;
  meaning: string;
  occasions: string[];
  description?: string;
  usageNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AppSettings {
  reminderDays: number;
  theme: 'light' | 'dark';
  notificationEnabled: boolean;
  shareSettings: ShareSettings;
  lowStockThreshold: number;
  contactExportSettings: ContactExportSettings;
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

export type ExpenseCategory = 'offering' | 'transport' | 'catering' | 'other';

export const EXPENSE_CATEGORY_META: Record<ExpenseCategory, { label: string; icon: string; color: string; bgColor: string }> = {
  offering: { label: '供品', icon: '🎁', color: 'text-amber-700', bgColor: 'bg-amber-50' },
  transport: { label: '交通', icon: '🚗', color: 'text-blue-700', bgColor: 'bg-blue-50' },
  catering: { label: '餐饮', icon: '🍱', color: 'text-emerald-700', bgColor: 'bg-emerald-50' },
  other: { label: '其他', icon: '📦', color: 'text-gray-700', bgColor: 'bg-gray-50' },
};

export interface RitualExpense {
  id: string;
  ritualId: string;
  ritualName?: string;
  amount: number;
  category: ExpenseCategory;
  date: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
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

export type EntityType = 'branches' | 'ancestors' | 'rituals' | 'reservations' | 'members' | 'settings' | 'templates' | 'events' | 'offerings' | 'locations' | 'rules' | 'articles' | 'expenses' | 'wiki';

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
  expenses: RitualExpense[];
  wiki: OfferingWiki[];
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

export interface SolarTerm {
  id: string;
  name: string;
  englishName: string;
  month: number;
  day: number;
  description: string;
  customs: string[];
  hasRitualCustom: boolean;
  ritualSuggestion?: string;
  offerings?: string[];
  color: string;
  icon: string;
}

export interface SolarTermWithDate extends SolarTerm {
  date: string;
  year: number;
}

export const SOLAR_TERMS_ORDER = [
  '立春', '雨水', '惊蛰', '春分', '清明', '谷雨',
  '立夏', '小满', '芒种', '夏至', '小暑', '大暑',
  '立秋', '处暑', '白露', '秋分', '寒露', '霜降',
  '立冬', '小雪', '大雪', '冬至', '小寒', '大寒',
] as const;
