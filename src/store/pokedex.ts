import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface PokedexStore {
  favorites: number[];
  addFavorite: (id: number) => void;
  removeFavorite: (id: number) => void;
  isFavorite: (id: number) => boolean;

  caughtPokemon: number[];
  toggleCaught: (id: number) => void;
  isCaught: (id: number) => boolean;
  showCaughtOnly: 'all' | 'caught' | 'uncaught';
  setShowCaughtOnly: (mode: 'all' | 'caught' | 'uncaught') => void;

  searchTerm: string;
  setSearchTerm: (term: string) => void;

  selectedTypes: string[];
  setSelectedTypes: (types: string[]) => void;
  toggleType: (type: string) => void;

  selectedGeneration: number | null;
  setSelectedGeneration: (gen: number | null) => void;

  isLegendary: boolean | null;
  setIsLegendary: (isLegendary: boolean | null) => void;

  minBaseStats: number;
  setMinBaseStats: (min: number) => void;

  heightRange: [number, number];
  setHeightRange: (range: [number, number]) => void;

  weightRange: [number, number];
  setWeightRange: (range: [number, number]) => void;

  selectedRegion: string | null;
  setSelectedRegion: (region: string | null) => void;

  showFavoritesOnly: boolean;
  setShowFavoritesOnly: (show: boolean) => void;

  sortBy: 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'height-asc' | 'height-desc' | 'weight-asc' | 'weight-desc';
  setSortBy: (sort: 'id-asc' | 'id-desc' | 'name-asc' | 'name-desc' | 'height-asc' | 'height-desc' | 'weight-asc' | 'weight-desc') => void;

  // Comparison
  compareList: number[];
  addToCompare: (id: number) => void;
  removeFromCompare: (id: number) => void;
  isInCompare: (id: number) => boolean;
  clearCompare: () => void;

  // Team
  team: number[];
  addToTeam: (id: number) => void;
  removeFromTeam: (id: number) => void;
  isInTeam: (id: number) => boolean;
  clearTeam: () => void;

  // History
  history: { id: number, name: string }[];
  addToHistory: (pokemon: { id: number, name: string }) => void;
  clearHistory: () => void;

  resetFilters: () => void;

  // Quiz
  quizHighScores: {
    survival: number;
    marathon: number;
    classic: number;
    silhouette: number;
    stats: number;
  };
  updateQuizHighScore: (mode: 'survival' | 'marathon' | 'classic' | 'silhouette' | 'stats', score: number) => void;

  // Onboarding
  hasCompletedOnboarding: boolean;
  setHasCompletedOnboarding: (completed: boolean) => void;

  // Settings
  isSettingsOpen: boolean;
  toggleSettings: () => void;
  soundEnabled: boolean;
  toggleSound: () => void;

  // Theme
  theme: Theme;
  setTheme: (theme: Theme) => void;

  // Language
  language: string;
  setLanguage: (lang: string) => void;
  getLanguageId: () => number;
  systemLanguage: string;
  setSystemLanguage: (lang: string) => void;
}

export const usePokedexStore = create<PokedexStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      addFavorite: (id) => set((state) => ({ favorites: [...state.favorites, id] })),
      removeFavorite: (id) => set((state) => ({ favorites: state.favorites.filter((fid) => fid !== id) })),
      isFavorite: (id) => get().favorites.includes(id),

      caughtPokemon: [],
      toggleCaught: (id) => set((state) => ({
        caughtPokemon: state.caughtPokemon.includes(id)
          ? state.caughtPokemon.filter((cid) => cid !== id)
          : [...state.caughtPokemon, id]
      })),
      isCaught: (id) => get().caughtPokemon.includes(id),
      showCaughtOnly: 'all',
      setShowCaughtOnly: (mode) => set({ showCaughtOnly: mode }),

      searchTerm: '',
      setSearchTerm: (term) => set({ searchTerm: term }),

      selectedTypes: [],
      setSelectedTypes: (types) => set({ selectedTypes: types }),
      toggleType: (type) => set((state) => ({
        selectedTypes: state.selectedTypes.includes(type)
          ? state.selectedTypes.filter((t) => t !== type)
          : [...state.selectedTypes, type]
      })),

      selectedGeneration: null,
      setSelectedGeneration: (gen) => set({ selectedGeneration: gen }),

      isLegendary: null,
      setIsLegendary: (isLegendary) => set({ isLegendary }),

      minBaseStats: 0,
      setMinBaseStats: (min) => set({ minBaseStats: min }),

      heightRange: [0, 20],
      setHeightRange: (range) => set({ heightRange: range }),

      weightRange: [0, 1000],
      setWeightRange: (range) => set({ weightRange: range }),

      selectedRegion: null,
      setSelectedRegion: (region) => set({ selectedRegion: region }),

      showFavoritesOnly: false,
      setShowFavoritesOnly: (show) => set({ showFavoritesOnly: show }),

      sortBy: 'id-asc',
      setSortBy: (sort) => set({ sortBy: sort }),

      // Comparison
      compareList: [],
      addToCompare: (id) => set((state) => {
        if (state.compareList.includes(id)) return state;
        if (state.compareList.length >= 3) return state;
        return { compareList: [...state.compareList, id] };
      }),
      removeFromCompare: (id) => set((state) => ({ 
        compareList: state.compareList.filter((cid) => cid !== id) 
      })),
      isInCompare: (id) => get().compareList.includes(id),
      clearCompare: () => set({ compareList: [] }),

      // Team
      team: [],
      addToTeam: (id) => set((state) => {
        if (state.team.includes(id)) return state;
        if (state.team.length >= 6) return state;
        return { team: [...state.team, id] };
      }),
      removeFromTeam: (id) => set((state) => ({ 
        team: state.team.filter((tid) => tid !== id) 
      })),
      isInTeam: (id) => get().team.includes(id),
      clearTeam: () => set({ team: [] }),

      // History
      history: [],
      addToHistory: (pokemon) => set((state) => {
        const filtered = state.history.filter(p => p.id !== pokemon.id);
        return { history: [pokemon, ...filtered].slice(0, 10) };
      }),
      clearHistory: () => set({ history: [] }),

      resetFilters: () => set({
        searchTerm: '',
        selectedTypes: [],
        selectedGeneration: null,
        isLegendary: null,
        minBaseStats: 0,
        heightRange: [0, 20],
        weightRange: [0, 1000],
        selectedRegion: null,
        showFavoritesOnly: false,
        showCaughtOnly: 'all',
      }),

      // Quiz
      quizHighScores: {
        survival: 0,
        marathon: 0,
        classic: 0,
        silhouette: 0,
        stats: 0,
      },
      updateQuizHighScore: (mode, score) => set((state) => ({
        quizHighScores: {
          ...state.quizHighScores,
          [mode]: Math.max(state.quizHighScores[mode], score)
        }
      })),

      // Onboarding
      hasCompletedOnboarding: false,
      setHasCompletedOnboarding: (completed) => set({ hasCompletedOnboarding: completed }),

      isSettingsOpen: false,
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),
      soundEnabled: true,
      toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled })),

      theme: 'system',
      setTheme: (theme) => set({ theme }),

      language: 'auto',
      setLanguage: (lang) => set({ language: lang }),
      getLanguageId: () => {
        const lang = get().language === 'auto' ? get().systemLanguage : get().language;
        return lang === 'fr' ? 5 : 9;
      },
      systemLanguage: typeof window !== 'undefined' ? (navigator.language.split('-')[0] || 'en') : 'en',
      setSystemLanguage: (lang) => set({ systemLanguage: lang }),
    }),
    {
      name: 'pokedex-storage',
      partialize: (state) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { searchTerm, systemLanguage, ...rest } = state;
        return rest;
      },
    }
  )
);
