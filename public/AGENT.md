## Structure

| Entry | Purpose |
|-------|---------|
| `icon.svg` | Application icon |
| `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` | Next.js/Vercel placeholders |

## `pokemon-cards/` Subdirectory

| Directory | Contents |
|-----------|----------|
| `css/` | Global and card-specific stylesheets |
| `css/cards/` | 23 per-rarity CSS files (basic, holo, v, v-max, etc.) |
| `img/` | 27 background textures and effect images for TCG rendering |

## Conventions

- Files served at root URL path (e.g., `/icon.svg`)
- Use `next/image` with `src="/path"` for images here
- No application code or configuration
