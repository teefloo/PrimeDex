# 📔 PrimeDex : Hooks & System Architecture

This `GEMINI.md` serves as the instructional context for the `src/hooks/` directory and general guidance for the PrimeDex Gaming Dashboard.

## 🚀 Project Overview
PrimeDex is a high-performance **Gaming Dashboard** for Pokémon, built with modern web technologies. It focuses on visual fidelity, responsiveness, and strict type safety.

### 🛠 Core Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Engine**: React 19 + TypeScript
- **Styling**: Tailwind CSS 4 (Theme-first configuration)
- **State**: TanStack Query v5 + Zustand (Persistence via idb-keyval)
- **API**: PokéAPI (Multi-client: REST + GraphQL)
- **Animation**: Framer Motion

## 📁 Directory Analysis: `src/hooks/`
This directory centralizes the application's custom React hooks.

### Key Files
- **`useKeyboardShortcuts.ts`**: 
  - Manages global navigation and UI state through keyboard events.
  - Supports shortcuts for:
    - `/` or `Ctrl+K`: Focus Search
    - `F`: Toggle Favorites
    - `C`: Navigate to Compare
    - `T`: Navigate to Team
    - `Q`: Navigate to Quiz
    - `S`: Toggle Settings
    - `H`: Navigate Home
    - `D`: Toggle Dark/Light Mode
  - Includes input-focus safety checks to prevent triggering shortcuts while typing.

## 📐 Engineering Standards

### Foundational Principles
1. **Performance First**: Use RSC for data-heavy sections. Client components (`'use client'`) are for leaf nodes only.
2. **Image Optimization**: All images MUST use `next/image`. Standard `<img>` tags are prohibited.
3. **Type Rigor**: Avoid `any` or `Record<string, unknown>`. Use established types from `src/types/`.
4. **Accessibility (A11y)**: WCAG 2.2 AA compliance is mandatory. Every interactive element needs an `aria-label`.
5. **Visual Polish**: Page transitions and hover states must use `framer-motion`. Dark-mode-first aesthetic.

### Development Workflow
- **State Management**: Use Zustand for UI state and TanStack Query for server state.
- **Testing**: Run `npx vitest` for verification. Tests should live alongside implementation.
- **Git**: Use conventional commits (`feat:`, `fix:`, `refactor:`, `docs:`).

## 🛠 Building and Running
- **TODO**: Identify specific scripts (e.g., `npm run dev`, `npm test`) from `package.json` at the project root.
- **Validation**: Ensure all new hooks are properly typed and documented within their files.
