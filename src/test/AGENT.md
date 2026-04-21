# Test Infrastructure

## Files
- `setup.ts` Vitest setup, mocks, helpers, and environment wiring

## Conventions
- Keep shared test infrastructure here.
- Prefer co-located tests next to source files.
- Use this folder for shared setup and mocks, not feature-specific assertions.
- Update tests when business logic changes.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
