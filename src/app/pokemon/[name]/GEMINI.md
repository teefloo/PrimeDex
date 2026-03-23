@../../../GEMINI.md

# app/pokemon/[name]/

Dynamic route for detailed Pokémon profiles, including stats, evolutions, and builds.

## Key Files
- `page.tsx`: Main entry for the dynamic Pokémon detail page.
- `PokemonDetailClient.tsx`: Client-side component for interactive elements like toggles and tabs.
- `opengraph-image.tsx`: Dynamically generated Open Graph images for each Pokémon.

## Rules
- **Hydration:** Ensure critical Pokémon data is prefetched on the server to avoid hydration mismatches.
- **SEO:** Use dynamic `generateMetadata` to populate page titles and descriptions per Pokémon.
