## Mission

Pokédex dashboard consuming PokéAPI with team analysis, evolution chains, and TCG integration.
Gaming Dashboard aesthetic: dark-mode-first, glassmorphic, smooth transitions via framer-motion.
Deployed on Vercel. Package manager: npm.

## Toolchain

| Action | Command | Authority |
|--------|---------|-----------|
| Install | `npm install` | package.json |
| Dev server | `npm run dev` | package.json |
| Build | `npm run build` | package.json |
| Lint | `npx eslint` | eslint.config.mjs |
| Typecheck | `npx tsc --noEmit` | tsconfig.json |
| Test | `npx vitest` | vitest.config.ts |

## Structure

```
src/
  app/          — Next.js App Router (pages, layouts, route handlers)
  components/
    ui/         — shadcn/ui primitives
    pokemon/    — domain components (TeamAnalysis, EvolutionChain…)
    layout/     — Shell, Header, Settings
  lib/
    api/        — centralized API clients (REST + GraphQL, axios + retry)
    i18n.ts     — translation function t()
    utils.ts    — cn() utility
  store/        — Zustand stores (Favorites, Team, Caught, Highscores; IDs/primitives only)
  hooks/        — custom React hooks (camelCase)
  types/
    pokemon.ts  — source of truth for all Pokémon-related types
  test/         — vitest setup and fixtures
```

## Conventions

- RSC by default; push `"use client"` to interaction leaf nodes only
- Named exports everywhere except Next.js page/layout files
- Components: PascalCase. Functions/hooks/variables: camelCase. Constants: UPPER_SNAKE_CASE
- All user-facing strings MUST use `t()` from `@/lib/i18n` — no hardcoded strings
- All API calls MUST go through `@/lib/api/` clients — no inline fetch/axios
- Use `next/image` exclusively — `<img>` tags are prohibited
- State stores: store only IDs and primitives, never large data blobs
- Import order: external → internal (`@/`) → styling
- TanStack Query for server state caching; Zustand for client UI persistence via idb-keyval
- WCAG 2.2 AA: `aria-label` on all interactive/icon elements, descriptive `alt` on all images
- Page transitions and hover/tap states use `framer-motion`

## Git Workflow

- Conventional commits: `feat:`, `fix:`, `refactor:`, `docs:`, `test:`, `chore:`
- Every AI-authored commit MUST include: `Co-authored-by: Gemini CLI <agent@gemini.google.com>`
- Run `npx tsc --noEmit` and `npx eslint` on changed files before committing
- Update tests when modifying business logic; verify with `npx vitest`

## Judgment Boundaries

**NEVER**
- Commit secrets or `.env` files (already gitignored — do not override)
- Use `<img>` tags instead of `next/image`
- Add a dependency without explicit user request
- Use `any` or `Record<string, unknown>` — define explicit types
- Inline API calls outside `@/lib/api/`
- Hardcode user-facing strings — always use `t()`
- Swallow errors — surface via UI or `sonner` toasts

**ASK**
- Deleting files or directories
- Broad refactoring across multiple modules
- Changing the component architecture or state management approach
- Modifying `tsconfig.json`, `eslint.config.mjs`, or `next.config.ts`

**ALWAYS**
- Explain the plan before writing code for non-trivial changes
- Handle all errors explicitly — never swallow
- Include `aria-label` on all interactive and icon-only elements
- Provide descriptive `alt` text on all images
- Verify changes with typecheck + lint before marking a task complete
- Protect API keys via `.env` variables — never inline
