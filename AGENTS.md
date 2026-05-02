# Agent Instructions

## Package Manager
Use **npm**:
```bash
npm install
npm run dev      # uses --webpack flag
npm run build
npm run lint     # eslint v9 with eslint-config-next
npm run test     # vitest with jsdom
npm run typecheck
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx eslint path/to/file.tsx` |
| Test | `npx vitest path/to/file.test.ts` |
| Test UI | `npx vitest --ui` |

## Key Conventions
- Next.js 16 App Router; RSC by default. Use `"use client"` only at interaction leaves.
- Tailwind CSS v4: `@import "tailwindcss"`, `@theme`, and `@custom-variant dark`. Do not use v3 `tailwind.config.js`.
- Use `@/` for internal imports.
- User-facing strings come from `t()` in `@/lib/i18n`.
- Server code uses `server-i18n.ts`; client code uses `i18n.ts`.
- All API calls go through `@/lib/api/` barrel export.
- Use `next/image`; no `<img>`.
- Zustand stores IDs and primitives only; persisted via `idb-keyval`.
- Keep SSR and client markup stable; use `useMounted` for browser-only branching.
- `src/*/AGENT.md` files override this file for their subtree.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
