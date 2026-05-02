# Layout Components

## Components
- `Header.tsx` top nav with logo, search, and links
- `Breadcrumbs.tsx` breadcrumb trail
- `HeroSection.tsx` landing hero
- `SettingsModal.tsx` shared settings dialog
- `SiteFooter.tsx` shared footer

## Conventions
- Use across multiple routes.
- `Header` is rendered per-page, not in the root layout.
- Open `SettingsModal` from shared state, not page-local state.
- Keep shell elements responsive and click-safe.
- Icon-only controls need `aria-label`.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
