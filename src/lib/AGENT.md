## Files

| File | Purpose |
|------|---------|
| `utils.ts` | `cn()` utility (clsx + tailwind-merge) |
| `i18n.ts` | Client-side translation function `t()` |
| `i18n-resources.ts` | Translation resource definitions |
| `server-i18n.ts` | Server-side i18n utilities |
| `held-items.ts` | Pokémon held items reference data |
| `pokemon-utils.ts` | Pokémon-specific pure functions |
| `team-analysis.ts` | Team composition analysis logic |

## Conventions

- `cn()` from `utils.ts` is standard for conditional class joining
- Client components: use `t()` from `i18n.ts`
- Server components: use `server-i18n.ts`
