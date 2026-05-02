# Src Instructions

## Scope
- `app/`: route segments, layouts, metadata, and route handlers.
- `components/`: `ui/`, `pokemon/`, `layout/`, and `tcg/`.
- `hooks/`: custom hooks.
- `lib/`: utilities, i18n, and API integration.
- `store/`: persisted Zustand state.
- `test/`: shared Vitest setup and fixtures.
- `types/`: domain type definitions.

## Conventions
- Use `@/` for internal imports.
- Keep Server Components as the default.
- Use `"use client"` only where interaction requires it.
- Treat `src/types/pokemon.ts` as the source of truth for domain types.
- Follow the closest `AGENT.md` for local rules.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
