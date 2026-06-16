import { Ancestor, Ritual, FamilyMember, AppSettings, RitualReservation, FamilyBranch } from '@/types';

const STORAGE_KEYS = {
  BRANCHES: 'family_branches',
  ANCESTORS: 'family_ancestors',
  RITUALS: 'family_rituals',
  RESERVATIONS: 'family_reservations',
  MEMBERS: 'family_members',
  SETTINGS: 'family_settings',
};

const defaultSettings: AppSettings = {
  reminderDays: 7,
  theme: 'light',
  notificationEnabled: true,
};

export const storage = {
  getBranches(): FamilyBranch[] {
    const data = localStorage.getItem(STORAGE_KEYS.BRANCHES);
    return data ? JSON.parse(data) : [];
  },

  setBranches(branches: FamilyBranch[]): void {
    localStorage.setItem(STORAGE_KEYS.BRANCHES, JSON.stringify(branches));
  },

  addBranch(branch: Omit<FamilyBranch, 'id' | 'createdAt' | 'updatedAt'>): FamilyBranch {
    const branches = this.getBranches();
    const newBranch: FamilyBranch = {
      ...branch,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    branches.push(newBranch);
    this.setBranches(branches);
    return newBranch;
  },

  updateBranch(id: string, data: Partial<FamilyBranch>): FamilyBranch | null {
    const branches = this.getBranches();
    const index = branches.findIndex(b => b.id === id);
    if (index === -1) return null;
    branches[index] = {
      ...branches[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setBranches(branches);
    return branches[index];
  },

  deleteBranch(id: string): boolean {
    const branches = this.getBranches();
    const filtered = branches.filter(b => b.id !== id);
    if (filtered.length === branches.length) return false;
    this.setBranches(filtered);
    
    const ancestors = this.getAncestors().map(a => 
      a.branchId === id ? { ...a, branchId: undefined } : a
    );
    this.setAncestors(ancestors);
    
    const members = this.getMembers().map(m => 
      m.branchId === id ? { ...m, branchId: undefined } : m
    );
    this.setMembers(members);
    
    const rituals = this.getRituals().map(r => 
      r.branchId === id ? { ...r, branchId: undefined } : r
    );
    this.setRituals(rituals);
    
    return true;
  },

  getAncestors(): Ancestor[] {
    const data = localStorage.getItem(STORAGE_KEYS.ANCESTORS);
    return data ? JSON.parse(data) : [];
  },

  setAncestors(ancestors: Ancestor[]): void {
    localStorage.setItem(STORAGE_KEYS.ANCESTORS, JSON.stringify(ancestors));
  },

  addAncestor(ancestor: Omit<Ancestor, 'id' | 'createdAt' | 'updatedAt'>): Ancestor {
    const ancestors = this.getAncestors();
    const newAncestor: Ancestor = {
      ...ancestor,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ancestors.push(newAncestor);
    this.setAncestors(ancestors);
    return newAncestor;
  },

  updateAncestor(id: string, data: Partial<Ancestor>): Ancestor | null {
    const ancestors = this.getAncestors();
    const index = ancestors.findIndex(a => a.id === id);
    if (index === -1) return null;
    ancestors[index] = {
      ...ancestors[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setAncestors(ancestors);
    return ancestors[index];
  },

  deleteAncestor(id: string): boolean {
    const ancestors = this.getAncestors();
    const filtered = ancestors.filter(a => a.id !== id);
    if (filtered.length === ancestors.length) return false;
    this.setAncestors(filtered);
    return true;
  },

  getRituals(): Ritual[] {
    const data = localStorage.getItem(STORAGE_KEYS.RITUALS);
    return data ? JSON.parse(data) : [];
  },

  setRituals(rituals: Ritual[]): void {
    localStorage.setItem(STORAGE_KEYS.RITUALS, JSON.stringify(rituals));
  },

  addRitual(ritual: Omit<Ritual, 'id' | 'createdAt'>): Ritual {
    const rituals = this.getRituals();
    const newRitual: Ritual = {
      ...ritual,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    rituals.push(newRitual);
    this.setRituals(rituals);
    return newRitual;
  },

  updateRitual(id: string, data: Partial<Ritual>): Ritual | null {
    const rituals = this.getRituals();
    const index = rituals.findIndex(r => r.id === id);
    if (index === -1) return null;
    rituals[index] = { ...rituals[index], ...data };
    this.setRituals(rituals);
    return rituals[index];
  },

  deleteRitual(id: string): boolean {
    const rituals = this.getRituals();
    const filtered = rituals.filter(r => r.id !== id);
    if (filtered.length === rituals.length) return false;
    this.setRituals(filtered);
    return true;
  },

  getMembers(): FamilyMember[] {
    const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
    return data ? JSON.parse(data) : [];
  },

  setMembers(members: FamilyMember[]): void {
    localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
  },

  addMember(member: Omit<FamilyMember, 'id' | 'createdAt'>): FamilyMember {
    const members = this.getMembers();
    const newMember: FamilyMember = {
      ...member,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    members.push(newMember);
    this.setMembers(members);
    return newMember;
  },

  updateMember(id: string, data: Partial<FamilyMember>): FamilyMember | null {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;
    members[index] = { ...members[index], ...data };
    this.setMembers(members);
    return members[index];
  },

  deleteMember(id: string): boolean {
    const members = this.getMembers();
    const filtered = members.filter(m => m.id !== id);
    if (filtered.length === members.length) return false;
    this.setMembers(filtered);
    return true;
  },

  getReservations(): RitualReservation[] {
    const data = localStorage.getItem(STORAGE_KEYS.RESERVATIONS);
    return data ? JSON.parse(data) : [];
  },

  setReservations(reservations: RitualReservation[]): void {
    localStorage.setItem(STORAGE_KEYS.RESERVATIONS, JSON.stringify(reservations));
  },

  addReservation(reservation: Omit<RitualReservation, 'id' | 'createdAt' | 'updatedAt'>): RitualReservation {
    const reservations = this.getReservations();
    const newReservation: RitualReservation = {
      ...reservation,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    reservations.push(newReservation);
    this.setReservations(reservations);
    return newReservation;
  },

  updateReservation(id: string, data: Partial<RitualReservation>): RitualReservation | null {
    const reservations = this.getReservations();
    const index = reservations.findIndex(r => r.id === id);
    if (index === -1) return null;
    reservations[index] = {
      ...reservations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setReservations(reservations);
    return reservations[index];
  },

  deleteReservation(id: string): boolean {
    const reservations = this.getReservations();
    const filtered = reservations.filter(r => r.id !== id);
    if (filtered.length === reservations.length) return false;
    this.setReservations(filtered);
    return true;
  },

  getSettings(): AppSettings {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data ? JSON.parse(data) : defaultSettings;
  },

  updateSettings(settings: Partial<AppSettings>): AppSettings {
    const current = this.getSettings();
    const updated = { ...current, ...settings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  exportData(): string {
    const data = {
      branches: this.getBranches(),
      ancestors: this.getAncestors(),
      rituals: this.getRituals(),
      reservations: this.getReservations(),
      members: this.getMembers(),
      settings: this.getSettings(),
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  },

  importData(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (data.branches) this.setBranches(data.branches);
      if (data.ancestors) this.setAncestors(data.ancestors);
      if (data.rituals) this.setRituals(data.rituals);
      if (data.reservations) this.setReservations(data.reservations);
      if (data.members) this.setMembers(data.members);
      if (data.settings) this.updateSettings(data.settings);
      return true;
    } catch {
      return false;
    }
  },

  clearAllData(): void {
    localStorage.removeItem(STORAGE_KEYS.BRANCHES);
    localStorage.removeItem(STORAGE_KEYS.ANCESTORS);
    localStorage.removeItem(STORAGE_KEYS.RITUALS);
    localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};
