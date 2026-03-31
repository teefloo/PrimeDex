## Routes

| Route | Purpose |
|-------|---------|
| `/` | Home — Pokédex listing |
| `/pokemon/[name]` | Dynamic Pokémon detail page |
| `/team` | Team builder |
| `/compare` | Pokémon comparison |
| `/favorites` | Favorites list |
| `/quiz` | Pokémon quiz |
| `/types` | Type effectiveness chart |

## Key Files

| File | Purpose |
|------|---------|
| `layout.tsx` | Root layout shell |
| `loading.tsx` | Global loading fallback |
| `not-found.tsx` | 404 page |
| `providers.tsx` | React Query + Zustand providers |
| `globals.css` | Tailwind v4 + global styles |
| `manifest.ts` | PWA manifest |
| `robots.ts` | robots.txt |
| `sitemap.ts` | Sitemap |

## Conventions

- Each route segment should have `loading.tsx` and `error.tsx` when needed
- Dynamic routes use `[name]` slug pattern
- OG images defined per-route via `opengraph-image.tsx`
