import { create } from 'zustand';
import { Ancestor, Ritual, FamilyMember, AppSettings, ReminderItem, RitualReservation, FamilyBranch } from '@/types';
import { storage } from '@/utils/storage';
import { getReminders } from '@/utils/dateUtils';
import { initializeMockData } from '@/utils/mockData';

interface AppState {
  branches: FamilyBranch[];
  ancestors: Ancestor[];
  rituals: Ritual[];
  reservations: RitualReservation[];
  members: FamilyMember[];
  settings: AppSettings;
  reminders: ReminderItem[];
  isInitialized: boolean;
  globalSearchTerm: string;
  
  initialize: () => void;
  refreshReminders: () => void;
  setGlobalSearchTerm: (term: string) => void;
  
  addBranch: (branch: Omit<FamilyBranch, 'id' | 'createdAt' | 'updatedAt'>) => FamilyBranch;
  updateBranch: (id: string, data: Partial<FamilyBranch>) => FamilyBranch | null;
  deleteBranch: (id: string) => boolean;
  
  addAncestor: (ancestor: Omit<Ancestor, 'id' | 'createdAt' | 'updatedAt'>) => Ancestor;
  updateAncestor: (id: string, data: Partial<Ancestor>) => Ancestor | null;
  deleteAncestor: (id: string) => boolean;
  
  addRitual: (ritual: Omit<Ritual, 'id' | 'createdAt'>) => Ritual;
  updateRitual: (id: string, data: Partial<Ritual>) => Ritual | null;
  deleteRitual: (id: string) => boolean;
  
  addReservation: (reservation: Omit<RitualReservation, 'id' | 'createdAt' | 'updatedAt'>) => RitualReservation;
  updateReservation: (id: string, data: Partial<RitualReservation>) => RitualReservation | null;
  deleteReservation: (id: string) => boolean;
  completeReservation: (id: string) => Ritual | null;
  
  addMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => FamilyMember;
  updateMember: (id: string, data: Partial<FamilyMember>) => FamilyMember | null;
  deleteMember: (id: string) => boolean;
  
  updateSettings: (settings: Partial<AppSettings>) => AppSettings;
  
  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  clearAllData: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  branches: [],
  ancestors: [],
  rituals: [],
  reservations: [],
  members: [],
  settings: {
    reminderDays: 7,
    theme: 'light',
    notificationEnabled: true,
  },
  reminders: [],
  isInitialized: false,
  globalSearchTerm: '',
  
  initialize: () => {
    if (get().isInitialized) return;
    
    initializeMockData();
    
    const branches = storage.getBranches();
    const ancestors = storage.getAncestors();
    const rituals = storage.getRituals();
    const reservations = storage.getReservations();
    const members = storage.getMembers();
    const settings = storage.getSettings();
    
    const reminders = getReminders(ancestors, settings.reminderDays, reservations);
    
    set({
      branches,
      ancestors,
      rituals,
      reservations,
      members,
      settings,
      reminders,
      isInitialized: true,
    });
  },
  
  refreshReminders: () => {
    const { ancestors, settings, reservations } = get();
    const reminders = getReminders(ancestors, settings.reminderDays, reservations);
    set({ reminders });
  },
  
  setGlobalSearchTerm: (term) => {
    set({ globalSearchTerm: term });
  },
  
  addBranch: (branch) => {
    const newBranch = storage.addBranch(branch);
    const branches = storage.getBranches();
    set({ branches });
    return newBranch;
  },
  
  updateBranch: (id, data) => {
    const updated = storage.updateBranch(id, data);
    if (updated) {
      const branches = storage.getBranches();
      set({ branches });
    }
    return updated;
  },
  
  deleteBranch: (id) => {
    const success = storage.deleteBranch(id);
    if (success) {
      const branches = storage.getBranches();
      const ancestors = storage.getAncestors();
      const members = storage.getMembers();
      const rituals = storage.getRituals();
      set({ branches, ancestors, members, rituals });
    }
    return success;
  },
  
  addAncestor: (ancestor) => {
    const newAncestor = storage.addAncestor(ancestor);
    const ancestors = storage.getAncestors();
    const { settings, reservations } = get();
    const reminders = getReminders(ancestors, settings.reminderDays, reservations);
    set({ ancestors, reminders });
    return newAncestor;
  },
  
  updateAncestor: (id, data) => {
    const updated = storage.updateAncestor(id, data);
    if (updated) {
      const ancestors = storage.getAncestors();
      const { settings, reservations } = get();
      const reminders = getReminders(ancestors, settings.reminderDays, reservations);
      set({ ancestors, reminders });
    }
    return updated;
  },
  
  deleteAncestor: (id) => {
    const success = storage.deleteAncestor(id);
    if (success) {
      const ancestors = storage.getAncestors();
      const rituals = storage.getRituals().filter(r => r.ancestorId !== id);
      const reservations = storage.getReservations().filter(r => r.ancestorId !== id);
      storage.setRituals(rituals);
      storage.setReservations(reservations);
      const { settings } = get();
      const reminders = getReminders(ancestors, settings.reminderDays, reservations);
      set({ ancestors, rituals, reservations, reminders });
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
  
  addReservation: (reservation) => {
    const newReservation = storage.addReservation(reservation);
    const reservations = storage.getReservations();
    const { ancestors, settings } = get();
    const reminders = getReminders(ancestors, settings.reminderDays, reservations);
    set({ reservations, reminders });
    return newReservation;
  },
  
  updateReservation: (id, data) => {
    const updated = storage.updateReservation(id, data);
    if (updated) {
      const reservations = storage.getReservations();
      const { ancestors, settings } = get();
      const reminders = getReminders(ancestors, settings.reminderDays, reservations);
      set({ reservations, reminders });
    }
    return updated;
  },
  
  deleteReservation: (id) => {
    const success = storage.deleteReservation(id);
    if (success) {
      const reservations = storage.getReservations();
      const { ancestors, settings } = get();
      const reminders = getReminders(ancestors, settings.reminderDays, reservations);
      set({ reservations, reminders });
    }
    return success;
  },
  
  completeReservation: (id) => {
    const reservation = storage.getReservations().find(r => r.id === id);
    if (!reservation) return null;
    
    const updatedReservation = storage.updateReservation(id, { status: 'completed' });
    if (!updatedReservation) return null;
    
    const newRitual = storage.addRitual({
      ancestorId: reservation.ancestorId,
      ancestorName: reservation.ancestorName,
      date: reservation.date,
      location: reservation.location,
      participants: reservation.participants,
      offerings: reservation.offerings,
      notes: reservation.notes,
    });
    
    const reservations = storage.getReservations();
    const rituals = storage.getRituals();
    const { ancestors, settings } = get();
    const reminders = getReminders(ancestors, settings.reminderDays, reservations);
    set({ reservations, rituals, reminders });
    
    return newRitual;
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
    const { ancestors, reservations } = get();
    const reminders = getReminders(ancestors, updated.reminderDays, reservations);
    set({ settings: updated, reminders });
    return updated;
  },
  
  exportData: () => {
    return storage.exportData();
  },
  
  importData: (jsonStr) => {
    const success = storage.importData(jsonStr);
    if (success) {
      const branches = storage.getBranches();
      const ancestors = storage.getAncestors();
      const rituals = storage.getRituals();
      const reservations = storage.getReservations();
      const members = storage.getMembers();
      const settings = storage.getSettings();
      const reminders = getReminders(ancestors, settings.reminderDays, reservations);
      set({ branches, ancestors, rituals, reservations, members, settings, reminders });
    }
    return success;
  },
  
  clearAllData: () => {
    storage.clearAllData();
    set({
      branches: [],
      ancestors: [],
      rituals: [],
      reservations: [],
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
