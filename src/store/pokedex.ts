import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface PokedexStore {
  favorites: number[];
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;

  searchTerm: string;
  setSearchTerm: (term: string) => void;

  selectedType: string | null;
  setSelectedType: (type: string | null) => void;

  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;

  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;

  sortBy: 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc';
  setSortBy: (sort: 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc') => void;

  // Settings
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

export const usePokedexStore = create<PokedexStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (id) => set((state) => ({ favorites: [...state.favorites, id] })),
      removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter((fid) => fid !== id) })),
      isFavorite: (id) => get().favorites.includes(id),

      searchTerm: '',
      setSearchTerm: (term) => set({ searchTerm: term }),

      selectedType: null,
      setSelectedType: (type) => set({ selectedType: type }),

      selectedRegion: null,
      setSelectedRegion: (region) => set({ selectedRegion: region }),

      showFavoritesOnly: false,
      setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

      sortBy: 'id-asc',
      setSortBy: (sort) => set({ sortBy: sort }),

      isSettingsOpen: false,
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      theme: 'system',
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'pokedex-storage',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { searchTerm, ...rest } = state;
        return rest;
      },
    }
  )
);
