## Structure

| Directory | Purpose |
|-----------|---------|
| `ui/` | shadcn/ui primitives + branding (PokeballIcon, PrimeDexLogo) |
| `pokemon/` | Domain-specific components (cards, filters, lists, charts) |
| `layout/` | Global shell components (Header, Breadcrumbs, SettingsModal) |

## Conventions

- Named exports only (no default exports)
- `ui/` primitives: no business logic, pure presentational
- `pokemon/` components: compose `ui/` primitives, handle domain logic
- `layout/` components: used across multiple routes
