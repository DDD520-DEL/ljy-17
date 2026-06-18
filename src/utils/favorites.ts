import { FavoriteItem, FavoriteEntityType } from '@/types';

const FAVORITES_STORAGE_KEY = 'family_favorites';

export const favoritesStorage = {
  getFavorites(): FavoriteItem[] {
    const data = localStorage.getItem(FAVORITES_STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  },

  setFavorites(favorites: FavoriteItem[]): void {
    localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  },

  addFavorite(
    entityType: FavoriteEntityType,
    entityId: string,
    name: string,
    subtitle?: string
  ): FavoriteItem {
    const favorites = this.getFavorites();
    const existing = favorites.find(
      f => f.entityType === entityType && f.entityId === entityId
    );
    if (existing) {
      return existing;
    }
    const newFavorite: FavoriteItem = {
      id: `${entityType}-${entityId}`,
      entityType,
      entityId,
      name,
      subtitle,
      createdAt: new Date().toISOString(),
    };
    favorites.push(newFavorite);
    this.setFavorites(favorites);
    return newFavorite;
  },

  removeFavorite(entityType: FavoriteEntityType, entityId: string): boolean {
    const favorites = this.getFavorites();
    const filtered = favorites.filter(
      f => !(f.entityType === entityType && f.entityId === entityId)
    );
    if (filtered.length === favorites.length) return false;
    this.setFavorites(filtered);
    return true;
  },

  isFavorite(entityType: FavoriteEntityType, entityId: string): boolean {
    const favorites = this.getFavorites();
    return favorites.some(
      f => f.entityType === entityType && f.entityId === entityId
    );
  },

  toggleFavorite(
    entityType: FavoriteEntityType,
    entityId: string,
    name: string,
    subtitle?: string
  ): { isFavorite: boolean; favorite: FavoriteItem | null } {
    if (this.isFavorite(entityType, entityId)) {
      this.removeFavorite(entityType, entityId);
      return { isFavorite: false, favorite: null };
    } else {
      const favorite = this.addFavorite(entityType, entityId, name, subtitle);
      return { isFavorite: true, favorite };
    }
  },
};
