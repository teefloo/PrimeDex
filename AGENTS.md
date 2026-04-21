# Agent Instructions

## Package Manager
Use **npm**:
```bash
npm install
npm run dev
npm run build
npm run lint
npm run test
npm run typecheck
```

## File-Scoped Commands
| Task | Command |
|------|---------|
| Typecheck | `npx tsc --noEmit` |
| Lint | `npx eslint path/to/file.tsx` |
| Test | `npx vitest path/to/file.test.ts` |

## Key Conventions
- Next.js App Router; RSC by default.
- Use `"use client"` only at interaction leaves.
- Use `@/` for internal imports.
- User-facing strings come from `t()` in `@/lib/i18n`.
- Server code uses `server-i18n.ts`; client code uses `i18n.ts`.
- All API calls go through `@/lib/api/`.
- Use `next/image`; no `<img>`.
- Zustand stores IDs and primitives only.
- Keep SSR and client markup stable.
- `src/*/AGENT.md` files override this file for their subtree.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
