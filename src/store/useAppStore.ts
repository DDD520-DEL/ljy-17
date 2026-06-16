import { create } from 'zustand';
import { Ancestor, Ritual, FamilyMember, AppSettings, ReminderItem } from '@/types';
import { storage } from '@/utils/storage';
import { getReminders } from '@/utils/dateUtils';
import { initializeMockData } from '@/utils/mockData';

interface AppState {
  ancestors: Ancestor[];
  rituals: Ritual[];
  members: FamilyMember[];
  settings: AppSettings;
  reminders: ReminderItem[];
  isInitialized: boolean;
  
  initialize: () => void;
  refreshReminders: () => void;
  
  addAncestor: (ancestor: Omit<Ancestor, 'id' | 'createdAt' | 'updatedAt'>) => Ancestor;
  updateAncestor: (id: string, data: Partial<Ancestor>) => Ancestor | null;
  deleteAncestor: (id: string) => boolean;
  
  addRitual: (ritual: Omit<Ritual, 'id' | 'createdAt'>) => Ritual;
  updateRitual: (id: string, data: Partial<Ritual>) => Ritual | null;
  deleteRitual: (id: string) => boolean;
  
  addMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => FamilyMember;
  updateMember: (id: string, data: Partial<FamilyMember>) => FamilyMember | null;
  deleteMember: (id: string) => boolean;
  
  updateSettings: (settings: Partial<AppSettings>) => AppSettings;
  
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  clearAllData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  ancestors: [],
  rituals: [],
  members: [],
  settings: {
    reminderDays: 7,
    theme: 'light',
    notificationEnabled: true,
  },
  reminders: [],
  isInitialized: false,
  
  initialize: () => {
    if (get().isInitialized) return;
    
    initializeMockData();
    
    const ancestors = storage.getAncestors();
    const rituals = storage.getRituals();
    const members = storage.getMembers();
    const settings = storage.getSettings();
    
    const reminders = getReminders(ancestors, settings.reminderDays);
    
    set({
      ancestors,
      rituals,
      members,
      settings,
      reminders,
      isInitialized: true,
    });
  },
  
  refreshReminders: () => {
    const { ancestors, settings } = get();
    const reminders = getReminders(ancestors, settings.reminderDays);
    set({ reminders });
  },
  
  addAncestor: (ancestor) => {
    const newAncestor = storage.addAncestor(ancestor);
    const ancestors = storage.getAncestors();
    const reminders = getReminders(ancestors, get().settings.reminderDays);
    set({ ancestors, reminders });
    return newAncestor;
  },
  
  updateAncestor: (id, data) => {
    const updated = storage.updateAncestor(id, data);
    if (updated) {
      const ancestors = storage.getAncestors();
      const reminders = getReminders(ancestors, get().settings.reminderDays);
      set({ ancestors, reminders });
    }
    return updated;
  },
  
  deleteAncestor: (id) => {
    const success = storage.deleteAncestor(id);
    if (success) {
      const ancestors = storage.getAncestors();
      const rituals = storage.getRituals().filter(r => r.ancestorId !== id);
      storage.setRituals(rituals);
      const reminders = getReminders(ancestors, get().settings.reminderDays);
      set({ ancestors, rituals, reminders });
    }
    return success;
  },
  
  addRitual: (ritual) => {
    const newRitual = storage.addRitual(ritual);
    const rituals = storage.getRituals();
    set({ rituals });
    return newRitual;
  },
  
  updateRitual: (id, data) => {
    const updated = storage.updateRitual(id, data);
    if (updated) {
      const rituals = storage.getRituals();
      set({ rituals });
    }
    return updated;
  },
  
  deleteRitual: (id) => {
    const success = storage.deleteRitual(id);
    if (success) {
      const rituals = storage.getRituals();
      set({ rituals });
    }
    return success;
  },
  
  addMember: (member) => {
    const newMember = storage.addMember(member);
    const members = storage.getMembers();
    set({ members });
    return newMember;
  },
  
  updateMember: (id, data) => {
    const updated = storage.updateMember(id, data);
    if (updated) {
      const members = storage.getMembers();
      set({ members });
    }
    return updated;
  },
  
  deleteMember: (id) => {
    const success = storage.deleteMember(id);
    if (success) {
      const members = storage.getMembers();
      set({ members });
    }
    return success;
  },
  
  updateSettings: (settings) => {
    const updated = storage.updateSettings(settings);
    const reminders = getReminders(get().ancestors, updated.reminderDays);
    set({ settings: updated, reminders });
    return updated;
  },
  
  exportData: () => {
    return storage.exportData();
  },
  
  importData: (jsonStr) => {
    const success = storage.importData(jsonStr);
    if (success) {
      const ancestors = storage.getAncestors();
      const rituals = storage.getRituals();
      const members = storage.getMembers();
      const settings = storage.getSettings();
      const reminders = getReminders(ancestors, settings.reminderDays);
      set({ ancestors, rituals, members, settings, reminders });
    }
    return success;
  },
  
  clearAllData: () => {
    storage.clearAllData();
    set({
      ancestors: [],
      rituals: [],
      members: [],
      settings: {
        reminderDays: 7,
        theme: 'light',
        notificationEnabled: true,
      },
      reminders: [],
    });
  },
}));
