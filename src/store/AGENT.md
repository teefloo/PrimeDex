# Store

## Files
- `primedex.ts` main Zustand store
- `primedex.test.ts` store tests

## State
- Favorites: Pokemon IDs
- Teams: up to 6 members
- Settings: language, theme, preferences
- Caught: caught / not-caught tracking
- Recently viewed: browsing history

## Conventions
- Store IDs and primitives only.
- Persist with `idb-keyval`.
- Mutate through store actions.
- Keep shape stable across upgrades.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
