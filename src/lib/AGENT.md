# Lib

## Files
- `utils.ts` `cn()` helper and string formatters
- `i18n.ts` client i18n with lazy-loaded language bundles
- `i18n-resources.ts` locale resources
- `server-i18n.ts` server i18n helpers (all bundles baked in)
- `held-items.ts` reference data
- `pokemon-utils.ts` pure Pokemon helpers
- `team-analysis.ts` team analysis logic
- `form-names.ts` alternate form name resolution
- `tcg-holo.ts` holographic card effect helpers
- `site.ts` SITE_URL and GITHUB_REPO_URL constants
- `languages.ts` language resolution and PokeAPI language ID mapping

## Conventions
- Keep utilities pure when possible.
- Client code uses `i18n.ts`; server code uses `server-i18n.ts`.
- Keep translation keys aligned with resource files.
- Reuse `cn()` for class joining.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
