export interface Ancestor {
  id: string;
  name: string;
  relationship: string;
  birthDate: string;
  deathDate: string;
  photo?: string;
  biography?: string;
  generation: number;
  createdAt: string;
  updatedAt: string;
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
  createdAt: string;
}

export interface AppSettings {
  reminderDays: number;
  theme: 'light' | 'dark';
  notificationEnabled: boolean;
}

export interface ReminderItem {
  id: string;
  ancestorId: string;
  ancestorName: string;
  type: 'birth' | 'death';
  date: string;
  daysLeft: number;
  dateStr: string;
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
  children: TreeNode[];
  spouse?: TreeNode;
}
