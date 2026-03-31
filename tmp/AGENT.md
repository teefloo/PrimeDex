## Files

| File | Purpose |
|------|---------|
| `check-i18n.js` | Validates `t()` calls against i18n resource keys |
| `invalid-keys.txt` | Output from `check-i18n.js` — empty = all valid |

## Usage

```bash
node tmp/check-i18n.js
```

## Conventions

- Excluded from build
- Development/maintenance scripts only
- No application code here
