# UI Components

## Scope
- `badge.tsx`, `button.tsx`, `card.tsx`, `command.tsx`, `dialog.tsx`
- `input.tsx`, `input-group.tsx`, `scroll-area.tsx`, `select.tsx`, `sheet.tsx`
- `skeleton.tsx`, `slider.tsx`, `sonner.tsx`, `switch.tsx`, `tabs.tsx`
- `textarea.tsx`, `tooltip.tsx`
- `PokeballIcon.tsx`, `PrimeDexLogo.tsx`, `ShinyIcon.tsx`, `TypeBadge.tsx`

## Conventions
- Keep these components presentational and free of business logic.
- Style with Tailwind CSS only.
- Use `cn()` from `@/lib/utils` for conditional classes.
- Preserve accessibility defaults in primitives.
- shadcn/ui style is `base-nova`; some primitives come from `@base-ui/react`.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
