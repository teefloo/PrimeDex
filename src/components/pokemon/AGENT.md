## Components

| Component | Purpose |
|-----------|---------|
| `AdvancedFilters.tsx` | Advanced filtering UI |
| `AdvancedFiltersWrapper.tsx` | Filter wrapper |
| `AdvancedInfo.tsx` | Extended Pokémon info |
| `CaughtFilter.tsx` | Caught/not-caught toggle |
| `CompareBar.tsx` | Comparison UI bar |
| `EvolutionChain.tsx` | Evolution chain visualizer |
| `FavoriteToggle.tsx` | Favorite toggle button |
| `HeightComparison.tsx` | Height comparison visual |
| `PokemonBuilds.tsx` | Build/loadout display |
| `PokemonCard.tsx` | Standard Pokémon card |
| `PokemonCard3D.tsx` | 3D animated card |
| `PokemonCards.tsx` | Card grid/list container |
| `PokemonList.tsx` | List view with pagination |
| `PokemonMoves.tsx` | Moves/attacks display |
| `RecentlyViewed.tsx` | Browsing history tracker |
| `RegionFilter.tsx` | Region-based filtering |
| `SearchBar.tsx` | Search with autocomplete |
| `SortSelector.tsx` | Sort order dropdown |
| `TypeChart.tsx` | Type effectiveness chart |
| `TypeFilter.tsx` | Type-based filtering |

## Data Flow

- Data via TanStack Query hooks from `@/lib/api/`
- Favorites/teams/caught via Zustand store (`@/store/primedex`)
- Types from `@/types/pokemon.ts`
