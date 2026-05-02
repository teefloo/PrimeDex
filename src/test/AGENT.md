# Test Infrastructure

## Files
- `setup.ts` Vitest setup: localStorage mock, matchMedia mock, jest-dom assertions

## Conventions
- Co-locate tests next to source files (`*.test.ts` / `*.test.tsx`).
- Keep shared test infrastructure here; no feature-specific assertions.
- Tests mock `next/navigation`, Zustand store, and UI primitives heavily.
- Vitest runs with `globals: true` and `environment: 'jsdom'`.
- Update tests when business logic changes.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
