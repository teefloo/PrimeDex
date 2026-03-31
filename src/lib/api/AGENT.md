## Files

| File | Purpose |
|------|---------|
| `client.ts` | Base Axios instance, interceptors, retry logic |
| `rest.ts` | PokéAPI v2 REST endpoints |
| `graphql.ts` | PokéAPI GraphQL endpoint |
| `tcg.ts` | Pokémon TCG API client |
| `cache.ts` | Caching layer utilities |
| `keys.ts` | TanStack Query key factory — single source of truth |

## Conventions

- Never call `fetch` or `axios` directly in components
- Query keys from `keys.ts` only — never construct inline
- API keys from environment variables only
- Retry logic configured at client level
