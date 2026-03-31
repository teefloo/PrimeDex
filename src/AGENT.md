## Structure

| Directory | Purpose |
|-----------|---------|
| `app/` | Next.js App Router pages, layouts, route handlers |
| `components/` | React components (ui/, pokemon/, layout/) |
| `hooks/` | Custom React hooks (camelCase) |
| `lib/` | Utilities, i18n, API integration |
| `store/` | Zustand state management with idb-keyval persistence |
| `test/` | Vitest setup and fixtures |
| `types/` | TypeScript type definitions |

## Conventions

- All internal imports use `@/` alias
- Server Components default; `"use client"` at interaction leaf nodes only
- `types/pokemon.ts` is the source of truth for all Pokémon types
