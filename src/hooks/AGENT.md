## Hooks

| Hook | Purpose |
|------|---------|
| `useKeyboardShortcuts.ts` | Keyboard shortcut bindings for app-wide actions |
| `useMounted.ts` | SSR-safe mounted state (prevents hydration mismatches) |

## Conventions

- `use` prefix mandatory
- Each hook solves one concern
- Use `useMounted` when accessing browser-only APIs
