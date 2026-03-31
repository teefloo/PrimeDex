## Files

| File | Purpose |
|------|---------|
| `primedex.ts` | Main Zustand store (favorites, teams, settings, caught, recently viewed) |
| `primedex.test.ts` | Store unit tests |

## Store Structure

- **Favorites**: Favorite Pokémon IDs
- **Teams**: Team compositions (max 6)
- **Settings**: Language, theme, preferences
- **Caught**: Caught/not-caught tracking
- **Recently Viewed**: Browsing history

## Conventions

- Store only IDs and primitives — no large data blobs
- Persistence via `idb-keyval`
- All mutations through store actions, never direct manipulation
