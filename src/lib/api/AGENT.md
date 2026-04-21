# API

## Files
- `client.ts` Axios base instance, interceptors, retry logic
- `rest.ts` PokeAPI REST endpoints
- `graphql.ts` GraphQL endpoint
- `tcg.ts` Pokemon TCG client
- `cache.ts` cache helpers
- `keys.ts` TanStack Query key factory

## Conventions
- Never call `fetch` or `axios` directly in components.
- Build query keys from `keys.ts`.
- Keep request and response types explicit.
- Keep API concerns centralized here.
- Store secrets only in environment variables.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
