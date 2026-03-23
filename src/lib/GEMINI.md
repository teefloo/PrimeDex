# 📦 PrimeDex : Library Context (`src/lib`)

This directory serves as the core engine of the PrimeDex application, housing all data fetching, state management helpers, internationalization, and domain-specific logic.

## 🏗️ Architecture Overview

### 1. Data Layer (`/api`)
The application uses a hybrid approach to data fetching, balancing speed and depth:
- **REST (`rest.ts`)**: Standard PokéAPI endpoints for individual resource fetching (Pokemon, Species, Moves).
- **GraphQL (`graphql.ts`)**: Beta PokéAPI GraphQL endpoint used for bulk summaries and complex localized data retrieval.
- **TCG (`tcg.ts`)**: Integration with TCGdex API for card game data, featuring multi-language image fallbacks.
- **Client (`client.ts`)**: Shared Axios instance with exponential backoff retry logic (via `axios-retry`).
- **Cache (`cache.ts`)**: Persistent offline-first caching using IndexedDB (`idb-keyval`). Default TTL is 7 days.
- **Keys (`keys.ts`)**: Source of truth for all TanStack Query factory keys.

### 2. Internationalization (`i18n.ts`, `server-i18n.ts`)
- **Client-Side**: Initialized with `react-i18next`. Syncs language with `localStorage` (`primedex-lang`).
- **Server-Side**: Static instance for RSC (React Server Components) compatibility.
- **Resources**: `i18n-resources.ts` contains all translations. Avoid hardcoding UI strings.

### 3. Pokemon Logic (`pokemon-utils.ts`, `team-analysis.ts`)
- **Visuals**: `TYPE_ICONS` maps Pokemon types to Lucide icons; `getTypeGradient` generates Tailwind-compatible gradients.
- **Analysis**: The `analyzeTeam` engine calculates synergy scores (0-100) based on:
  - Type redundancy penalties.
  - Offensive coverage bonuses.
  - Major weakness detection (3+ weaknesses with no resistance).
  - Stat-based focus suggestions.

### 4. Shared Utilities (`utils.ts`)
- `cn`: Standard Tailwind CSS class merging.
- `formatId`: Pads IDs (e.g., `#001`).
- `capitalize`/`formatName`: Handles PokéAPI kebab-case strings.

## 🛠️ Development Standards

- **Persistence**: When adding new API calls, always implement caching via `getCachedData`/`setCachedData`.
- **Type Safety**: All responses must be typed. Avoid `any` even in complex GraphQL transformations.
- **Performance**: Heavy computations (like team analysis) should be memoized at the component level.
- **Localization**: Use the `t()` function for all user-facing text.

## 🚦 Key Commands (Library)
- **Validation**: `npx vitest src/lib` (Run tests for utility logic).
- **Type Check**: `npx tsc --noEmit` (Validate library types).
