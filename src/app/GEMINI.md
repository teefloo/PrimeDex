# PrimeDex — The Ultimate Online Pokédex

PrimeDex is a high-performance, SEO-optimized Pokémon tracking and team-building dashboard built with Next.js 14/15. It provides detailed information on all Pokémon, including stats, abilities, types, and evolutions, with a focus on speed and user experience.

## Project Overview

- **Framework:** Next.js (App Router)
- **Styling:** Tailwind CSS, shadcn/ui components
- **State Management:** Zustand (for global application state)
- **Data Fetching:** TanStack Query (React Query) for client-side, native `fetch` with server-side prefetching
- **Internationalization:** i18next supporting English (en) and French (fr)
- **API:** Custom wrapper around PokeAPI (REST & GraphQL)
- **SEO:** Dynamic metadata generation, JSON-LD structured data, and automated sitemaps

## Key Features

- **Infinite Scrolling Pokédex:** Fast, filterable list of all Pokémon.
- **Detailed Profiles:** Comprehensive stats, type advantages, and evolution chains for every species.
- **Team Builder:** Create and manage custom Pokémon teams.
- **Comparison Tool:** Compare multiple Pokémon side-by-side.
- **Favorites:** Personal list of tracked Pokémon.
- **Quiz:** Interactive Pokémon knowledge challenges.
- **Multi-language Support:** Toggle between English and French with system language detection.
- **Performance:** Server-side prefetching and dynamic OpenGraph image generation.

## Directory Structure (src/app/)

- `compare/`: Logic for the Pokémon comparison tool.
- `favorites/`: Personal list management.
- `pokemon/[name]/`: Dynamic routes for detailed Pokémon pages.
- `quiz/`: Pokémon knowledge game.
- `team/`: Team builder interface.
- `types/`: Pokémon type interaction charts and data.
- `AppContent.tsx`: Main client-side wrapper for layout-persistent components (Toaster, CompareBar).
- `providers.tsx`: Application-wide providers (QueryClient, Theme, i18n).

## Building and Running

Typical Next.js commands apply (assumed based on project structure):

- **Development:** `npm run dev`
- **Build:** `npm run build`
- **Production Start:** `npm start`
- **Linting:** `npm run lint`

## Development Conventions

- **Server-First Data Fetching:** Prefer prefetching data in server components using `QueryClient` for hydration.
- **Type Safety:** Use established interfaces in `src/types` for all Pokémon data.
- **Client Components:** Use the `'use client'` directive sparingly, focusing interactivity in specific client components (e.g., `PokemonDetailClient.tsx`).
- **i18n:** Use the `t` function from `@/lib/server-i18n` for server components and standard `useTranslation` for client components.
- **Styling:** Follow the existing Tailwind patterns using CSS variables defined in `globals.css`.
