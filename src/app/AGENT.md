# App Routes

## Routes
- `/` home / Pokedex listing
- `/pokemon/[name]` detail page
- `/team` team builder
- `/compare` comparison
- `/favorites` favorites
- `/quiz` quiz modes
- `/types` type chart
- `/tcg` Pokemon TCG view
- `/privacy` privacy policy
- `/terms` terms of service

## Key Files
- `layout.tsx` root shell (no Header here)
- `loading.tsx` loading fallback
- `not-found.tsx` 404 page
- `providers.tsx` React Query + Zustand + theme + i18n providers
- `AppContent.tsx` shared client wrapper (dev-only `Agentation` on port 4747)
- `globals.css` Tailwind v4 global styles with glassmorphism variables
- `manifest.ts` PWA manifest
- `robots.ts` robots.txt
- `sitemap.ts` sitemap
- `opengraph-image.tsx` route OG images

## Conventions
- Keep metadata and OG assets next to the route.
- Keep `layout.tsx` server-side.
- Put browser-only logic in `providers.tsx` or client components.
- Add `loading.tsx` and `error.tsx` when needed.
- User-facing route strings come from `t()`.
- Use `revalidate` / `dynamicParams` on dynamic routes (e.g., `revalidate = 3600` on `[name]`).
- Use `generateStaticParams` for high-traffic slugs (first 151 pokemon pre-rendered).
- Prefetch TanStack Query data in RSC and wrap with `HydrationBoundary`.
- `Header` is rendered per-page, not in the root layout.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
