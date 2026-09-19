import { create } from 'zustand';
import { Property } from '@/lib/types';

interface PropertyStore {
  comparisonList: Property[];
  favoritesList: string[]; // Property IDs
  isComparisonModalOpen: boolean;
  
  addToComparison: (property: Property) => boolean;
  removeFromComparison: (propertyId: string) => void;
  clearComparison: () => void;
  setComparisonModalOpen: (open: boolean) => void;
  
  toggleFavorite: (propertyId: string) => void;
}

export const usePropertyStore = create<PropertyStore>((set, get) => ({
  comparisonList: [],
  favoritesList: [],
  isComparisonModalOpen: false,

  addToComparison: (property: Property) => {
    const { comparisonList } = get();
    if (comparisonList.some((p) => p.id === property.id)) {
      set({ comparisonList: comparisonList.filter((p) => p.id !== property.id) });
      return false; // Removed
    }
    if (comparisonList.length >= 3) {
      return false; // Max limit reached
    }
    set({ comparisonList: [...comparisonList, property] });
    return true; // Added
  },

  removeFromComparison: (propertyId: string) => {
    set((state) => ({
      comparisonList: state.comparisonList.filter((p) => p.id !== propertyId),
    }));
  },

  clearComparison: () => {
    set({ comparisonList: [] });
  },

  setComparisonModalOpen: (open: boolean) => {
    set({ isComparisonModalOpen: open });
  },

  toggleFavorite: (propertyId: string) => {
    set((state) => {
      const exists = state.favoritesList.includes(propertyId);
      return {
        favoritesList: exists
          ? state.favoritesList.filter((id) => id !== propertyId)
          : [...state.favoritesList, propertyId],
      };
    });
  },
}));
