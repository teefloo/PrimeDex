# Pokemon Components

## Components
- `PokemonCard.tsx`, `PokemonCards.tsx`, `PokemonCard3D.tsx`
- `SearchBar.tsx`, `AdvancedFilters.tsx`, `SortSelector.tsx`, `TypeFilter.tsx`
- `CaughtFilter.tsx`, `RegionFilter.tsx`, `FavoriteToggle.tsx`, `RecentlyViewed.tsx`
- `EvolutionChain.tsx`, `CompareBar.tsx`, `TypeChart.tsx`
- `PokemonMoves.tsx`, `PokemonBuilds.tsx`, `AdvancedInfo.tsx`, `HeightComparison.tsx`

## Data Flow
- Data comes from TanStack Query hooks backed by `@/lib/api/`.
- Favorites, teams, caught state, and history come from `@/store/primedex`.
- Shared types come from `@/types/pokemon`.
- Keep interactive widgets SSR-safe.
- Favor small, composable components.

## Conventions
- Heavy components (e.g., `EvolutionChain`, `AdvancedInfo`) use `next/dynamic`.
- Use `useMounted` when browser APIs would cause hydration mismatches.
- `CompareBarSlot` is rendered globally in `AppContent.tsx`.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
