# Hooks

## Hooks
- `useKeyboardShortcuts.ts`
- `useMounted.ts`

## Conventions
- One hook, one concern.
- Use `useMounted` when browser APIs would cause hydration mismatches.
- Prefer SSR-safe derived state before mounted-only branching.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
