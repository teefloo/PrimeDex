# Public Assets

## Contents
- Static assets only.
- `icon.svg` application icon.
- `pokemon-cards/` card textures, CSS, and TCG assets required by `tcg-holo.ts` and TCG components.

## Conventions
- Files are served from the site root.
- Keep this folder framework-agnostic.
- Use `next/image` from app code when referencing these assets.
- Do not add application code or config.
- Do not delete `pokemon-cards/` assets; they are runtime dependencies.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
