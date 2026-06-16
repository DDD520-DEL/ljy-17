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

export interface AppSettings {
  reminderDays: number;
  theme: 'light' | 'dark';
  notificationEnabled: boolean;
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
