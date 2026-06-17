import { Ancestor, Ritual, FamilyMember, AppSettings, RitualReservation, FamilyBranch, RitualTemplate, FamilyEvent, OfferingItem, MemorialLocation } from '@/types';
import { changeTracker } from '@/services/changeTracker';

const STORAGE_KEYS = {
  BRANCHES: 'family_branches',
  ANCESTORS: 'family_ancestors',
  RITUALS: 'family_rituals',
  EVENTS: 'family_events',
  RESERVATIONS: 'family_reservations',
  MEMBERS: 'family_members',
  TEMPLATES: 'ritual_templates',
  OFFERINGS: 'ritual_offerings',
  LOCATIONS: 'memorial_locations',
  SETTINGS: 'family_settings',
};

const defaultSettings: AppSettings = {
  reminderDays: 7,
  theme: 'light',
  notificationEnabled: true,
  shareSettings: {
    includeBirthDeathDates: true,
    includePhotos: true,
  },
  lowStockThreshold: 2,
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
    changeTracker.recordChange('branches', newBranch.id, 'create');
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
    changeTracker.recordChange('branches', id, 'update');
    return branches[index];
  },

  deleteBranch(id: string): boolean {
    const branches = this.getBranches();
    const filtered = branches.filter(b => b.id !== id);
    if (filtered.length === branches.length) return false;
    this.setBranches(filtered);
    changeTracker.recordChange('branches', id, 'delete');
    
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
    changeTracker.recordChange('ancestors', newAncestor.id, 'create');
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
    changeTracker.recordChange('ancestors', id, 'update');
    return ancestors[index];
  },

  deleteAncestor(id: string): boolean {
    const ancestors = this.getAncestors();
    const filtered = ancestors.filter(a => a.id !== id);
    if (filtered.length === ancestors.length) return false;
    this.setAncestors(filtered);
    changeTracker.recordChange('ancestors', id, 'delete');
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
    changeTracker.recordChange('rituals', newRitual.id, 'create');
    return newRitual;
  },

  updateRitual(id: string, data: Partial<Ritual>): Ritual | null {
    const rituals = this.getRituals();
    const index = rituals.findIndex(r => r.id === id);
    if (index === -1) return null;
    rituals[index] = { ...rituals[index], ...data };
    this.setRituals(rituals);
    changeTracker.recordChange('rituals', id, 'update');
    return rituals[index];
  },

  deleteRitual(id: string): boolean {
    const rituals = this.getRituals();
    const filtered = rituals.filter(r => r.id !== id);
    if (filtered.length === rituals.length) return false;
    this.setRituals(filtered);
    changeTracker.recordChange('rituals', id, 'delete');
    return true;
  },

  getEvents(): FamilyEvent[] {
    const data = localStorage.getItem(STORAGE_KEYS.EVENTS);
    return data ? JSON.parse(data) : [];
  },

  setEvents(events: FamilyEvent[]): void {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events));
  },

  addEvent(event: Omit<FamilyEvent, 'id' | 'createdAt' | 'updatedAt'>): FamilyEvent {
    const events = this.getEvents();
    const newEvent: FamilyEvent = {
      ...event,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    events.push(newEvent);
    this.setEvents(events);
    changeTracker.recordChange('events', newEvent.id, 'create');
    return newEvent;
  },

  updateEvent(id: string, data: Partial<FamilyEvent>): FamilyEvent | null {
    const events = this.getEvents();
    const index = events.findIndex(e => e.id === id);
    if (index === -1) return null;
    events[index] = {
      ...events[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setEvents(events);
    changeTracker.recordChange('events', id, 'update');
    return events[index];
  },

  deleteEvent(id: string): boolean {
    const events = this.getEvents();
    const filtered = events.filter(e => e.id !== id);
    if (filtered.length === events.length) return false;
    this.setEvents(filtered);
    changeTracker.recordChange('events', id, 'delete');
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
    changeTracker.recordChange('members', newMember.id, 'create');
    return newMember;
  },

  updateMember(id: string, data: Partial<FamilyMember>): FamilyMember | null {
    const members = this.getMembers();
    const index = members.findIndex(m => m.id === id);
    if (index === -1) return null;
    members[index] = { ...members[index], ...data };
    this.setMembers(members);
    changeTracker.recordChange('members', id, 'update');
    return members[index];
  },

  deleteMember(id: string): boolean {
    const members = this.getMembers();
    const filtered = members.filter(m => m.id !== id);
    if (filtered.length === members.length) return false;
    this.setMembers(filtered);
    changeTracker.recordChange('members', id, 'delete');
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
    changeTracker.recordChange('reservations', newReservation.id, 'create');
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
    changeTracker.recordChange('reservations', id, 'update');
    return reservations[index];
  },

  deleteReservation(id: string): boolean {
    const reservations = this.getReservations();
    const filtered = reservations.filter(r => r.id !== id);
    if (filtered.length === reservations.length) return false;
    this.setReservations(filtered);
    changeTracker.recordChange('reservations', id, 'delete');
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
    changeTracker.recordChange('settings', 'settings', 'update');
    return updated;
  },

  getTemplates(): RitualTemplate[] {
    const data = localStorage.getItem(STORAGE_KEYS.TEMPLATES);
    return data ? JSON.parse(data) : [];
  },

  setTemplates(templates: RitualTemplate[]): void {
    localStorage.setItem(STORAGE_KEYS.TEMPLATES, JSON.stringify(templates));
  },

  addTemplate(template: Omit<RitualTemplate, 'id' | 'createdAt' | 'updatedAt'>): RitualTemplate {
    const templates = this.getTemplates();
    const newTemplate: RitualTemplate = {
      ...template,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.push(newTemplate);
    this.setTemplates(templates);
    changeTracker.recordChange('templates', newTemplate.id, 'create');
    return newTemplate;
  },

  updateTemplate(id: string, data: Partial<RitualTemplate>): RitualTemplate | null {
    const templates = this.getTemplates();
    const index = templates.findIndex(t => t.id === id);
    if (index === -1) return null;
    templates[index] = {
      ...templates[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setTemplates(templates);
    changeTracker.recordChange('templates', id, 'update');
    return templates[index];
  },

  deleteTemplate(id: string): boolean {
    const templates = this.getTemplates();
    const filtered = templates.filter(t => t.id !== id);
    if (filtered.length === templates.length) return false;
    this.setTemplates(filtered);
    changeTracker.recordChange('templates', id, 'delete');
    return true;
  },

  getOfferings(): OfferingItem[] {
    const data = localStorage.getItem(STORAGE_KEYS.OFFERINGS);
    return data ? JSON.parse(data) : [];
  },

  setOfferings(offerings: OfferingItem[]): void {
    localStorage.setItem(STORAGE_KEYS.OFFERINGS, JSON.stringify(offerings));
  },

  addOffering(offering: Omit<OfferingItem, 'id' | 'createdAt' | 'updatedAt'>): OfferingItem {
    const offerings = this.getOfferings();
    const newOffering: OfferingItem = {
      ...offering,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    offerings.push(newOffering);
    this.setOfferings(offerings);
    changeTracker.recordChange('offerings', newOffering.id, 'create');
    return newOffering;
  },

  updateOffering(id: string, data: Partial<OfferingItem>): OfferingItem | null {
    const offerings = this.getOfferings();
    const index = offerings.findIndex(o => o.id === id);
    if (index === -1) return null;
    offerings[index] = {
      ...offerings[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setOfferings(offerings);
    changeTracker.recordChange('offerings', id, 'update');
    return offerings[index];
  },

  deleteOffering(id: string): boolean {
    const offerings = this.getOfferings();
    const filtered = offerings.filter(o => o.id !== id);
    if (filtered.length === offerings.length) return false;
    this.setOfferings(filtered);
    changeTracker.recordChange('offerings', id, 'delete');
    return true;
  },

  consumeOffering(offeringName: string, quantity: number = 1): boolean {
    const offerings = this.getOfferings();
    const offering = offerings.find(o => o.name === offeringName);
    if (!offering) return false;
    
    const newQuantity = Math.max(0, offering.quantity - quantity);
    const index = offerings.findIndex(o => o.id === offering.id);
    offerings[index] = {
      ...offerings[index],
      quantity: newQuantity,
      updatedAt: new Date().toISOString(),
    };
    this.setOfferings(offerings);
    changeTracker.recordChange('offerings', offering.id, 'update');
    return true;
  },

  getLocations(): MemorialLocation[] {
    const data = localStorage.getItem(STORAGE_KEYS.LOCATIONS);
    return data ? JSON.parse(data) : [];
  },

  setLocations(locations: MemorialLocation[]): void {
    localStorage.setItem(STORAGE_KEYS.LOCATIONS, JSON.stringify(locations));
  },

  addLocation(location: Omit<MemorialLocation, 'id' | 'createdAt' | 'updatedAt'>): MemorialLocation {
    const locations = this.getLocations();
    const newLocation: MemorialLocation = {
      ...location,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    locations.push(newLocation);
    this.setLocations(locations);
    changeTracker.recordChange('locations', newLocation.id, 'create');
    return newLocation;
  },

  updateLocation(id: string, data: Partial<MemorialLocation>): MemorialLocation | null {
    const locations = this.getLocations();
    const index = locations.findIndex(l => l.id === id);
    if (index === -1) return null;
    locations[index] = {
      ...locations[index],
      ...data,
      updatedAt: new Date().toISOString(),
    };
    this.setLocations(locations);
    changeTracker.recordChange('locations', id, 'update');
    return locations[index];
  },

  deleteLocation(id: string): boolean {
    const locations = this.getLocations();
    const filtered = locations.filter(l => l.id !== id);
    if (filtered.length === locations.length) return false;
    this.setLocations(filtered);
    changeTracker.recordChange('locations', id, 'delete');
    return true;
  },

  exportData(): string {
    const data = {
      branches: this.getBranches(),
      ancestors: this.getAncestors(),
      rituals: this.getRituals(),
      events: this.getEvents(),
      reservations: this.getReservations(),
      members: this.getMembers(),
      templates: this.getTemplates(),
      offerings: this.getOfferings(),
      locations: this.getLocations(),
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
      if (data.events) this.setEvents(data.events);
      if (data.reservations) this.setReservations(data.reservations);
      if (data.members) this.setMembers(data.members);
      if (data.templates) this.setTemplates(data.templates);
      if (data.offerings) this.setOfferings(data.offerings);
      if (data.locations) this.setLocations(data.locations);
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
    localStorage.removeItem(STORAGE_KEYS.EVENTS);
    localStorage.removeItem(STORAGE_KEYS.RESERVATIONS);
    localStorage.removeItem(STORAGE_KEYS.MEMBERS);
    localStorage.removeItem(STORAGE_KEYS.TEMPLATES);
    localStorage.removeItem(STORAGE_KEYS.OFFERINGS);
    localStorage.removeItem(STORAGE_KEYS.LOCATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
  },
};
