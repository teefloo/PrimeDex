# PrimeDex — Types Module Context

This directory (`src/app/types`) manages the interactive Pokémon type chart and elemental mastery analysis for the PrimeDex application.

## Directory Overview

The `types` module provides a comprehensive interface for users to explore Pokémon type interactions, including offensive strengths, defensive resistances, and immunities. It serves as an educational tool for both casual and competitive players.

### Key Files

- **`page.tsx`**: The main entry point for the types route. It is a client-side component (`'use client'`) that handles:
  - Interactive type selection.
  - Real-time data fetching using TanStack Query (React Query) for type relations and emblematic Pokémon.
  - Animated UI transitions via `framer-motion`.
  - Multi-language support through `useTranslation`.
- **`layout.tsx`**: A server-side wrapper that defines SEO metadata and includes JSON-LD structured data for search engine optimization.

## Project Context (PrimeDex)

- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS, shadcn/ui, Lucide Icons
- **State & Data**: Zustand (global state), TanStack Query (fetching)
- **Internationalization**: i18next (English & French)

## Development Conventions

- **Interactive UI**: Use `'use client'` for pages requiring immediate feedback or complex state, like this type selector.
- **Data Hydration**: Prefer server-side prefetching where possible, although this specific module relies on client-side queries for its interactive nature.
- **Styling**: Adhere to the "glass-panel" design system and Tailwind patterns established in `globals.css`.
- **SEO**: Always include dynamic metadata and structured data in `layout.tsx` or `page.tsx`.
- **i18n**: Utilize the `t` function for all user-facing strings to maintain support for both English and French.

## Building and Running

Assuming standard Next.js conventions as defined in the root project:

- **Development**: `npm run dev`
- **Build**: `npm run build`
- **Linting**: `npm run lint`
- **Type Checking**: `npm run type-check` (or `tsc`)
