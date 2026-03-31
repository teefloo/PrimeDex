## Files

| File | Purpose |
|------|---------|
| `setup.ts` | Vitest setup — global mocks, test utilities, environment |

## Conventions

- Tests co-located with source files (`*.test.ts` next to source)
- This directory: shared test infrastructure only
- Run all: `npx vitest`
- Run single: `npx vitest path/to/file.test.ts`
- Update tests when modifying business logic
