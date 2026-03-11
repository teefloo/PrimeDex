# Pokédex Project Overview

A modern Pokédex application built with the latest React and Next.js features, providing a rich user interface to explore Pokémon data from the PokéAPI.

## 🛠 Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Library**: [React 19](https://react.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management**:
  - **Server State**: [TanStack Query v5](https://tanstack.com/query/latest) (fetching, caching, and synchronization)
  - **Global/Client State**: [Zustand](https://docs.pmnd.rs/zustand/getting-started/introduction) (favorites, search terms, UI settings)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **API Client**: [Axios](https://axios-http.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (accessible, reusable components)

## 📁 Project Structure

- `src/app/`: Next.js App Router pages, layouts, and providers.
  - `pokemon/[name]/page.tsx`: Detailed view for a specific Pokémon.
- `src/components/`: Reusable UI components.
  - `layout/`: Global layout elements like `Header` and `SettingsModal`.
  - `pokemon/`: Domain-specific components like `PokemonCard`, `EvolutionChain`, and `SearchBar`.
  - `ui/`: Base UI primitives (buttons, inputs, cards, etc.) managed via shadcn/ui.
- `src/lib/`: Core logic and utilities.
  - `api.ts`: PokéAPI integration using Axios.
  - `utils.ts`: Helper functions (e.g., tailwind-merge).
- `src/store/`: Zustand store definitions for global state persistence.
- `src/types/`: TypeScript interfaces and types for Pokémon data.
- `public/`: Static assets (SVG icons, etc.).

## 🚀 Building and Running

### Development
```bash
npm run dev
```
Starts the development server at `http://localhost:3000`.

### Production
```bash
npm run build
npm run start
```
Builds the application for production and starts the server.

### Linting
```bash
npm run lint
```
Runs ESLint to check for code quality and style issues.

## 💡 Development Conventions

- **Next.js App Router**: Use Server Components where possible for data fetching, and Client Components (`'use client'`) for interactive elements.
- **Styling**: Adhere to Tailwind CSS 4 patterns. Use the `cn` utility from `src/lib/utils.ts` for conditional class merging.
- **State Management**:
  - Use **TanStack Query** for any data originating from the PokéAPI to benefit from built-in caching.
  - Use the **Zustand** store (`src/store/pokedex.ts`) for cross-component UI state and data that needs to persist across sessions (like favorites).
- **Types**: Always define and use TypeScript interfaces in `src/types/` for PokéAPI responses to ensure type safety across the application.
- **Components**: Follow the existing structure by placing new UI primitives in `src/components/ui` and feature-specific components in their respective subdirectories.
- **Images**: All Pokémon images are fetched from `raw.githubusercontent.com` or `pokeapi.co`. Ensure `next.config.ts` remote patterns are updated if adding new image sources.
