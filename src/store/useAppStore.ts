import { create } from 'zustand';
import {
  Ancestor,
  Ritual,
  FamilyMember,
  AppSettings,
  ReminderItem,
  RitualReservation,
  FamilyBranch,
  User,
  LoginCredentials,
  RegisterData,
  SyncState,
  ConflictItem,
  ConflictResolution,
  RitualTemplate,
  FamilyEvent,
  OfferingItem,
  MemorialLocation,
  FamilyRule,
} from '@/types';
import { storage } from '@/utils/storage';
import { getReminders } from '@/utils/dateUtils';
import { initializeMockData } from '@/utils/mockData';
import { authService } from '@/services/authService';
import { syncService } from '@/services/syncService';
import { syncOrchestrator, conflictResolver } from '@/services/cloudSync';
import { changeTracker } from '@/services/changeTracker';

interface AppState {
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
  settings: AppSettings;
  reminders: ReminderItem[];
  isInitialized: boolean;
  globalSearchTerm: string;

  user: User | null;
  isAuthLoading: boolean;
  syncState: SyncState;
  pendingConflicts: ConflictItem[] | null;

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

  addEvent: (event: Omit<FamilyEvent, 'id' | 'createdAt' | 'updatedAt'>) => FamilyEvent;
  updateEvent: (id: string, data: Partial<FamilyEvent>) => FamilyEvent | null;
  deleteEvent: (id: string) => boolean;

  addReservation: (reservation: Omit<RitualReservation, 'id' | 'createdAt' | 'updatedAt'>) => RitualReservation;
  updateReservation: (id: string, data: Partial<RitualReservation>) => RitualReservation | null;
  deleteReservation: (id: string) => boolean;
  completeReservation: (id: string) => Ritual | null;

  addMember: (member: Omit<FamilyMember, 'id' | 'createdAt'>) => FamilyMember;
  updateMember: (id: string, data: Partial<FamilyMember>) => FamilyMember | null;
  deleteMember: (id: string) => boolean;

  addTemplate: (template: Omit<RitualTemplate, 'id' | 'createdAt' | 'updatedAt'>) => RitualTemplate;
  updateTemplate: (id: string, data: Partial<RitualTemplate>) => RitualTemplate | null;
  deleteTemplate: (id: string) => boolean;

  addOffering: (offering: Omit<OfferingItem, 'id' | 'createdAt' | 'updatedAt'>) => OfferingItem;
  updateOffering: (id: string, data: Partial<OfferingItem>) => OfferingItem | null;
  deleteOffering: (id: string) => boolean;
  consumeOfferings: (offeringNames: string[]) => void;

  addLocation: (location: Omit<MemorialLocation, 'id' | 'createdAt' | 'updatedAt'>) => MemorialLocation;
  updateLocation: (id: string, data: Partial<MemorialLocation>) => MemorialLocation | null;
  deleteLocation: (id: string) => boolean;

  addRule: (rule: Omit<FamilyRule, 'id' | 'createdAt' | 'updatedAt'>) => FamilyRule;
  updateRule: (id: string, data: Partial<FamilyRule>) => FamilyRule | null;
  deleteRule: (id: string) => boolean;
  reorderRules: (sourceId: string, targetId: string) => FamilyRule[];

  updateSettings: (settings: Partial<AppSettings>) => AppSettings;

  exportData: () => string;
  importData: (jsonStr: string) => boolean;
  clearAllData: () => void;

  checkAuth: () => Promise<void>;
  login: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;

  setAutoSyncEnabled: (enabled: boolean) => void;
  syncNow: (onConflict?: (conflicts: ConflictItem[]) => Promise<Map<string, ConflictResolution> | null>) => Promise<{ success: boolean; error?: string }>;
  forceUpload: () => Promise<{ success: boolean; error?: string }>;
  forceDownload: () => Promise<{ success: boolean; error?: string }>;
  resolveConflicts: (resolutions: Map<string, ConflictResolution>) => Promise<{ success: boolean; error?: string }>;
  dismissConflicts: () => void;
  refreshPendingChanges: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  branches: [],
  ancestors: [],
  rituals: [],
  events: [],
  reservations: [],
  members: [],
  templates: [],
  offerings: [],
  locations: [],
  rules: [],
  settings: {
    reminderDays: 7,
    theme: 'light',
    notificationEnabled: true,
    shareSettings: {
      includeBirthDeathDates: true,
      includePhotos: true,
    },
    lowStockThreshold: 2,
  },
  reminders: [],
  isInitialized: false,
  globalSearchTerm: '',

  user: null,
  isAuthLoading: false,
  syncState: {
    status: 'idle',
    lastSyncAt: null,
    lastSyncError: null,
    autoSyncEnabled: true,
    pendingChanges: 0,
  },
  pendingConflicts: null,
  
  initialize: () => {
    if (get().isInitialized) return;
    
    initializeMockData();
    
    const branches = storage.getBranches();
    const ancestors = storage.getAncestors();
    const rituals = storage.getRituals();
    const events = storage.getEvents();
    const reservations = storage.getReservations();
    const members = storage.getMembers();
    const templates = storage.getTemplates();
    const offerings = storage.getOfferings();
    const locations = storage.getLocations();
    const rules = storage.getRules();
    const settings = storage.getSettings();
    
    const reminders = getReminders(ancestors, settings.reminderDays, reservations);
    
    set({
      branches,
      ancestors,
      rituals,
      events,
      reservations,
      members,
      templates,
      offerings,
      locations,
      rules,
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
      const events = storage.getEvents().map(e =>
        e.branchId === id ? { ...e, branchId: undefined } : e
      );
      storage.setEvents(events);
      set({ branches, ancestors, members, rituals, events });
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
    if (ritual.offerings && ritual.offerings.length > 0) {
      ritual.offerings.forEach(offering => {
        storage.consumeOffering(offering, 1);
      });
      const offerings = storage.getOfferings();
      set({ rituals, offerings });
    } else {
      set({ rituals });
    }
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

  addEvent: (event) => {
    const newEvent = storage.addEvent(event);
    const events = storage.getEvents();
    set({ events });
    return newEvent;
  },

  updateEvent: (id, data) => {
    const updated = storage.updateEvent(id, data);
    if (updated) {
      const events = storage.getEvents();
      set({ events });
    }
    return updated;
  },

  deleteEvent: (id) => {
    const success = storage.deleteEvent(id);
    if (success) {
      const events = storage.getEvents();
      set({ events });
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
    
    if (reservation.offerings && reservation.offerings.length > 0) {
      reservation.offerings.forEach(offering => {
        storage.consumeOffering(offering, 1);
      });
    }
    
    const reservations = storage.getReservations();
    const rituals = storage.getRituals();
    const offerings = storage.getOfferings();
    const { ancestors, settings } = get();
    const reminders = getReminders(ancestors, settings.reminderDays, reservations);
    set({ reservations, rituals, offerings, reminders });
    
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
  
  addTemplate: (template) => {
    const newTemplate = storage.addTemplate(template);
    const templates = storage.getTemplates();
    set({ templates });
    return newTemplate;
  },
  
  updateTemplate: (id, data) => {
    const updated = storage.updateTemplate(id, data);
    if (updated) {
      const templates = storage.getTemplates();
      set({ templates });
    }
    return updated;
  },
  
  deleteTemplate: (id) => {
    const success = storage.deleteTemplate(id);
    if (success) {
      const templates = storage.getTemplates();
      set({ templates });
    }
    return success;
  },
  
  addOffering: (offering) => {
    const newOffering = storage.addOffering(offering);
    const offerings = storage.getOfferings();
    set({ offerings });
    return newOffering;
  },
  
  updateOffering: (id, data) => {
    const updated = storage.updateOffering(id, data);
    if (updated) {
      const offerings = storage.getOfferings();
      set({ offerings });
    }
    return updated;
  },
  
  deleteOffering: (id) => {
    const success = storage.deleteOffering(id);
    if (success) {
      const offerings = storage.getOfferings();
      set({ offerings });
    }
    return success;
  },
  
  consumeOfferings: (offeringNames) => {
    offeringNames.forEach(name => {
      storage.consumeOffering(name, 1);
    });
    const offerings = storage.getOfferings();
    set({ offerings });
  },
  
  addLocation: (location) => {
    const newLocation = storage.addLocation(location);
    const locations = storage.getLocations();
    set({ locations });
    return newLocation;
  },
  
  updateLocation: (id, data) => {
    const updated = storage.updateLocation(id, data);
    if (updated) {
      const locations = storage.getLocations();
      set({ locations });
    }
    return updated;
  },
  
  deleteLocation: (id) => {
    const success = storage.deleteLocation(id);
    if (success) {
      const locations = storage.getLocations();
      set({ locations });
    }
    return success;
  },

  addRule: (rule) => {
    const newRule = storage.addRule(rule);
    const rules = storage.getRules();
    set({ rules });
    return newRule;
  },

  updateRule: (id, data) => {
    const updated = storage.updateRule(id, data);
    if (updated) {
      const rules = storage.getRules();
      set({ rules });
    }
    return updated;
  },

  deleteRule: (id) => {
    const success = storage.deleteRule(id);
    if (success) {
      const rules = storage.getRules();
      set({ rules });
    }
    return success;
  },

  reorderRules: (sourceId, targetId) => {
    const reorderedRules = storage.reorderRules(sourceId, targetId);
    set({ rules: reorderedRules });
    return reorderedRules;
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
      const events = storage.getEvents();
      const reservations = storage.getReservations();
      const members = storage.getMembers();
      const templates = storage.getTemplates();
      const offerings = storage.getOfferings();
      const locations = storage.getLocations();
      const rules = storage.getRules();
      const settings = storage.getSettings();
      const reminders = getReminders(ancestors, settings.reminderDays, reservations);
      set({ branches, ancestors, rituals, events, reservations, members, templates, offerings, locations, rules, settings, reminders });
    }
    return success;
  },
  
  clearAllData: () => {
    storage.clearAllData();
    changeTracker.clearChanges();
    set({
      branches: [],
      ancestors: [],
      rituals: [],
      events: [],
      reservations: [],
      members: [],
      templates: [],
      offerings: [],
      locations: [],
      rules: [],
      settings: {
        reminderDays: 7,
        theme: 'light',
        notificationEnabled: true,
        shareSettings: {
          includeBirthDeathDates: true,
          includePhotos: true,
        },
        lowStockThreshold: 2,
      },
      reminders: [],
      syncState: {
        ...get().syncState,
        pendingChanges: 0,
      },
    });
  },

  checkAuth: async () => {
    set({ isAuthLoading: true });
    try {
      const user = await authService.getCurrentUser();
      if (user) {
        set({ user });
      }
    } finally {
      set({ isAuthLoading: false });
    }
  },

  login: async (credentials) => {
    set({ isAuthLoading: true });
    try {
      const result = await authService.login(credentials);
      if (result.success && result.user) {
        set({ user: result.user, isAuthLoading: false });
        return { success: true };
      }
      set({ isAuthLoading: false });
      return { success: false, error: result.error };
    } catch (e) {
      set({ isAuthLoading: false });
      return { success: false, error: e instanceof Error ? e.message : '登录失败' };
    }
  },

  register: async (data) => {
    set({ isAuthLoading: true });
    try {
      const result = await authService.register(data);
      if (result.success && result.user) {
        set({ user: result.user, isAuthLoading: false });
        return { success: true };
      }
      set({ isAuthLoading: false });
      return { success: false, error: result.error };
    } catch (e) {
      set({ isAuthLoading: false });
      return { success: false, error: e instanceof Error ? e.message : '注册失败' };
    }
  },

  logout: async () => {
    await authService.logout();
    set({
      user: null,
      syncState: {
        ...get().syncState,
        status: 'idle',
        lastSyncError: null,
      },
      pendingConflicts: null,
    });
  },

  setAutoSyncEnabled: (enabled) => {
    set(state => ({
      syncState: { ...state.syncState, autoSyncEnabled: enabled },
    }));
  },

  syncNow: async (onConflict) => {
    if (!get().user) {
      return { success: false, error: '请先登录' };
    }

    set(state => ({ syncState: { ...state.syncState, status: 'syncing', lastSyncError: null } }));

    try {
      const { branches, ancestors, rituals, events, reservations, members, templates, offerings, locations, rules, settings } = get();

      const result = await syncOrchestrator.performSync(
        { branches, ancestors, rituals, events, reservations, members, templates, offerings, locations, rules, settings },
        onConflict
      );

      if (!result.success) {
        if (result.conflicts && result.conflicts.length > 0) {
          set({
            pendingConflicts: result.conflicts,
            syncState: { ...get().syncState, status: 'conflict' },
          });
          return { success: false, error: '存在数据冲突需要解决' };
        }
        set(state => ({
          syncState: { ...state.syncState, status: 'error', lastSyncError: result.error || '同步失败' },
        }));
        return { success: false, error: result.error };
      }

      if (result.mergedData) {
        storage.setBranches(result.mergedData.branches);
        storage.setAncestors(result.mergedData.ancestors);
        storage.setRituals(result.mergedData.rituals);
        storage.setEvents(result.mergedData.events || []);
        storage.setReservations(result.mergedData.reservations);
        storage.setMembers(result.mergedData.members);
        storage.setTemplates(result.mergedData.templates);
        storage.setOfferings(result.mergedData.offerings || []);
        storage.setLocations(result.mergedData.locations || []);
        storage.setRules(result.mergedData.rules || []);
        storage.updateSettings(result.mergedData.settings);

        const reminders = getReminders(result.mergedData.ancestors, result.mergedData.settings.reminderDays, result.mergedData.reservations);

        set({
          branches: result.mergedData.branches,
          ancestors: result.mergedData.ancestors,
          rituals: result.mergedData.rituals,
          events: result.mergedData.events || [],
          reservations: result.mergedData.reservations,
          members: result.mergedData.members,
          templates: result.mergedData.templates,
          offerings: result.mergedData.offerings || [],
          locations: result.mergedData.locations || [],
          rules: result.mergedData.rules || [],
          settings: result.mergedData.settings,
          reminders,
        });
      }

      const uploadResult = await syncService.uploadSnapshot({
        branches: get().branches,
        ancestors: get().ancestors,
        rituals: get().rituals,
        events: get().events,
        reservations: get().reservations,
        members: get().members,
        templates: get().templates,
        offerings: get().offerings,
        locations: get().locations,
        rules: get().rules,
        settings: get().settings,
      });

      if (!uploadResult.success) {
        set(state => ({
          syncState: { ...state.syncState, status: 'error', lastSyncError: uploadResult.error || '上传失败' },
        }));
        return { success: false, error: uploadResult.error };
      }

      changeTracker.clearChanges();
      const syncedAt = new Date().toISOString();
      set(state => ({
        syncState: {
          ...state.syncState,
          status: 'success',
          lastSyncAt: syncedAt,
          lastSyncError: null,
          pendingChanges: 0,
        },
      }));

      setTimeout(() => {
        const current = get().syncState;
        if (current.status === 'success') {
          set(state => ({ syncState: { ...state.syncState, status: 'idle' } }));
        }
      }, 3000);

      return { success: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : '同步失败';
      set(state => ({
        syncState: { ...state.syncState, status: 'error', lastSyncError: error },
      }));
      return { success: false, error };
    }
  },

  forceUpload: async () => {
    if (!get().user) {
      return { success: false, error: '请先登录' };
    }

    set(state => ({ syncState: { ...state.syncState, status: 'syncing', lastSyncError: null } }));

    try {
      const { branches, ancestors, rituals, events, reservations, members, templates, offerings, locations, rules, settings } = get();
      const result = await syncService.forceUpload({ branches, ancestors, rituals, events, reservations, members, templates, offerings, locations, rules, settings });

      if (!result.success) {
        set(state => ({
          syncState: { ...state.syncState, status: 'error', lastSyncError: result.error || '上传失败' },
        }));
        return { success: false, error: result.error };
      }

      changeTracker.clearChanges();
      const syncedAt = new Date().toISOString();
      set(state => ({
        syncState: {
          ...state.syncState,
          status: 'success',
          lastSyncAt: syncedAt,
          lastSyncError: null,
          pendingChanges: 0,
        },
      }));

      setTimeout(() => {
        const current = get().syncState;
        if (current.status === 'success') {
          set(state => ({ syncState: { ...state.syncState, status: 'idle' } }));
        }
      }, 3000);

      return { success: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : '上传失败';
      set(state => ({
        syncState: { ...state.syncState, status: 'error', lastSyncError: error },
      }));
      return { success: false, error };
    }
  },

  forceDownload: async () => {
    if (!get().user) {
      return { success: false, error: '请先登录' };
    }

    set(state => ({ syncState: { ...state.syncState, status: 'syncing', lastSyncError: null } }));

    try {
      const result = await syncService.forceDownload();

      if (!result.success) {
        set(state => ({
          syncState: { ...state.syncState, status: 'error', lastSyncError: result.error || '下载失败' },
        }));
        return { success: false, error: result.error };
      }

      if (result.snapshot) {
        storage.setBranches(result.snapshot.branches);
        storage.setAncestors(result.snapshot.ancestors);
        storage.setRituals(result.snapshot.rituals);
        storage.setEvents(result.snapshot.events || []);
        storage.setReservations(result.snapshot.reservations);
        storage.setMembers(result.snapshot.members);
        storage.setTemplates(result.snapshot.templates);
        storage.setOfferings(result.snapshot.offerings || []);
        storage.setLocations(result.snapshot.locations || []);
        storage.setRules(result.snapshot.rules || []);
        storage.updateSettings(result.snapshot.settings);

        const reminders = getReminders(result.snapshot.ancestors, result.snapshot.settings.reminderDays, result.snapshot.reservations);

        set({
          branches: result.snapshot.branches,
          ancestors: result.snapshot.ancestors,
          rituals: result.snapshot.rituals,
          events: result.snapshot.events || [],
          reservations: result.snapshot.reservations,
          members: result.snapshot.members,
          templates: result.snapshot.templates,
          offerings: result.snapshot.offerings || [],
          locations: result.snapshot.locations || [],
          rules: result.snapshot.rules || [],
          settings: result.snapshot.settings,
          reminders,
        });
      }

      const syncedAt = new Date().toISOString();
      set(state => ({
        syncState: {
          ...state.syncState,
          status: 'success',
          lastSyncAt: syncedAt,
          lastSyncError: null,
        },
      }));

      setTimeout(() => {
        const current = get().syncState;
        if (current.status === 'success') {
          set(state => ({ syncState: { ...state.syncState, status: 'idle' } }));
        }
      }, 3000);

      return { success: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : '下载失败';
      set(state => ({
        syncState: { ...state.syncState, status: 'error', lastSyncError: error },
      }));
      return { success: false, error };
    }
  },

  resolveConflicts: async (resolutions) => {
    const pendingConflicts = get().pendingConflicts;
    if (!pendingConflicts || !get().user) {
      return { success: false, error: '没有待解决的冲突' };
    }

    try {
      const resolvedMap = conflictResolver.resolveAllConflicts(pendingConflicts, 'merge', resolutions);

      const { branches, ancestors, rituals, events, reservations, members, templates, offerings, locations, rules, settings } = get();
      const { mergeEngine } = await import('@/services/cloudSync');
      const mergeResult = mergeEngine.mergeLocalAndRemote(
        { branches, ancestors, rituals, events, reservations, members, templates, offerings, locations, rules, settings },
        undefined,
        resolvedMap
      );
      const { stats: _stats, ...mergedData } = mergeResult;
      void _stats;

      storage.setBranches(mergedData.branches);
      storage.setAncestors(mergedData.ancestors);
      storage.setRituals(mergedData.rituals);
      storage.setEvents(mergedData.events || []);
      storage.setReservations(mergedData.reservations);
      storage.setMembers(mergedData.members);
      storage.setTemplates(mergedData.templates);
      storage.setOfferings(mergedData.offerings || []);
      storage.setLocations(mergedData.locations || []);
      storage.setRules(mergedData.rules || []);
      storage.updateSettings(mergedData.settings);

      const reminders = getReminders(mergedData.ancestors, mergedData.settings.reminderDays, mergedData.reservations);

      const uploadResult = await syncService.uploadSnapshot({
        branches: mergedData.branches,
        ancestors: mergedData.ancestors,
        rituals: mergedData.rituals,
        events: mergedData.events || [],
        reservations: mergedData.reservations,
        members: mergedData.members,
        templates: mergedData.templates,
        offerings: mergedData.offerings || [],
        locations: mergedData.locations || [],
        rules: mergedData.rules || [],
        settings: mergedData.settings,
      });

      if (!uploadResult.success) {
        set(state => ({
          syncState: { ...state.syncState, status: 'error', lastSyncError: uploadResult.error },
        }));
        return { success: false, error: uploadResult.error };
      }

      changeTracker.clearChanges();
      const syncedAt = new Date().toISOString();
      set({
        branches: mergedData.branches,
        ancestors: mergedData.ancestors,
        rituals: mergedData.rituals,
        events: mergedData.events || [],
        reservations: mergedData.reservations,
        members: mergedData.members,
        templates: mergedData.templates,
        offerings: mergedData.offerings || [],
        locations: mergedData.locations || [],
        rules: mergedData.rules || [],
        settings: mergedData.settings,
        reminders,
        pendingConflicts: null,
        syncState: {
          ...get().syncState,
          status: 'success',
          lastSyncAt: syncedAt,
          lastSyncError: null,
          pendingChanges: 0,
        },
      });

      setTimeout(() => {
        const current = get().syncState;
        if (current.status === 'success') {
          set(state => ({ syncState: { ...state.syncState, status: 'idle' } }));
        }
      }, 3000);

      return { success: true };
    } catch (e) {
      const error = e instanceof Error ? e.message : '解决冲突失败';
      set(state => ({
        syncState: { ...state.syncState, status: 'error', lastSyncError: error },
      }));
      return { success: false, error };
    }
  },

  dismissConflicts: () => {
    set({
      pendingConflicts: null,
      syncState: { ...get().syncState, status: 'idle' },
    });
  },

  refreshPendingChanges: () => {
    set(state => ({
      syncState: { ...state.syncState, pendingChanges: changeTracker.getPendingCount() },
    }));
  },
}));
