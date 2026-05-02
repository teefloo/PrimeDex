# Components

## Scope
- `ui/`: primitives and branding.
- `pokemon/`: domain components for cards, filters, lists, charts, and analysis.
- `layout/`: shared shell, navigation, hero, and settings.
- `tcg/`: Pokemon TCG-specific components.

## Conventions
- Use named exports.
- Keep `ui/` presentational.
- Let `pokemon/` own domain composition and interactivity.
- Let `layout/` host cross-route UI.
- Keep shared shells SSR-safe.
- Some heavy components use `next/dynamic` to avoid bloating bundles.
- Tests mock UI primitives and `next/navigation` heavily.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
