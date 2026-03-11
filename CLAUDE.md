# Agent Instructions

## Package Manager
Use **npm**: `npm install`, `npm run dev`, `npm run build`

## Commit Attribution
AI commits MUST include:
```
Co-authored-by: Gemini CLI <agent@gemini.google.com>
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `npx tsc --noEmit path/to/file.ts` |
| Lint | `npx eslint path/to/file.ts` |
| Test | `npx vitest path/to/file.test.ts` |

## Key Conventions
- **Routing**: Next.js 16 App Router. Prefer Server Components (RSC) for data-heavy sections.
- **Styling**: Tailwind CSS v4. Use `cn()` utility. Follow the glassmorphic aesthetic.
- **State**: TanStack Query v5 (Server) + Zustand (Client Persistence via idb-keyval).
- **API**: Use centralized clients in `src/lib/api/` (REST/GraphQL).
- **i18n**: All user-facing strings MUST use `t()` from `src/lib/i18n.ts`.
- **Images**: MUST use `next/image`. Standard `<img>` tags are forbidden.
- **Accessibility**: WCAG 2.2 AA compliance. Mandatory `aria-label` on all interactive/icon elements.
- **Type Rigor**: `src/types/pokemon.ts` is the Source of Truth. Usage of `any` is prohibited.
- **Testing**: Run `npx vitest`. Tests MUST be updated when modifying business logic.
