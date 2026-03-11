# 📔 Ultra Pokédex: Foundational Mandates

This document serves as the absolute authority for development within this workspace. Its instructions take precedence over any global defaults.

## 🚀 Vision & Quality Bar
The Ultra Pokédex is a high-performance **Gaming Dashboard**. Every interaction must be responsive, visual fidelity must be high (glassmorphism, Framer Motion), and the architecture strictly type-safe.

## 🛠 Core Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Engine**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 (Theme-first configuration)
- **State**: TanStack Query v5 + Zustand (Persistence via idb-keyval)
- **API**: PokéAPI (Multi-client: REST + GraphQL)

## 📁 System Architecture

### 1. The Store (`src/store/`)
Manages persistence (Favorites, Team, Caught status, Highscores) and UI State. Large blobs are forbidden; store only IDs and primitives.

### 2. Data Layer (`src/lib/api/`)
Aggressive caching and centralized client logic. Axios with retry support. All UI strings must be localized via `react-i18next`.

### 3. Component Hierarchy
- `src/components/ui/`: Base shadcn/ui primitives.
- `src/components/pokemon/`: Domain logic (TeamAnalysis, EvolutionChain, etc.).
- `src/components/layout/`: Global Shell, Header, and Settings.

## 📐 Engineering Standards

### Foundational Principles
1. **Performance First**: Use RSC for data-heavy sections. Client components (`'use client'`) are for leaf nodes only.
2. **Image Optimization**: All images MUST use `next/image`. Standard `<img>` tags are prohibited.
3. **Type Rigor**: `src/types/pokemon.ts` is the Source of Truth. No `any` or `Record<string, unknown>`.
4. **Accessibility (A11y)**: WCAG 2.2 AA compliance is mandatory. Every interactive element needs an `aria-label`; every image needs an `alt`.
5. **Visual Polish**: Page transitions and hover states must use `framer-motion`. Dark-mode-first aesthetic.

## 🛡️ Operational Safeguards
- **Testing**: Run `npx vitest` before any major refactor. Tests live alongside implementation.
- **Environment**: Protect all keys using `.env` patterns.
- **Git**: Follow conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`).

---
*This file is a living document. Update it as the architecture evolves.*
