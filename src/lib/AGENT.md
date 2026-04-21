# Lib

## Files
- `utils.ts` `cn()` helper
- `i18n.ts` client `t()`
- `i18n-resources.ts` locale resources
- `server-i18n.ts` server i18n helpers
- `held-items.ts` reference data
- `pokemon-utils.ts` pure Pokemon helpers
- `team-analysis.ts` team analysis logic

## Conventions
- Keep utilities pure when possible.
- Client code uses `i18n.ts`; server code uses `server-i18n.ts`.
- Keep translation keys aligned with resource files.
- Reuse `cn()` for class joining.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
