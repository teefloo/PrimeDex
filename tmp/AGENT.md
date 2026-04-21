# Tmp

## Files
- `check-i18n.js` validates `t()` calls against resource keys
- `invalid-keys.txt` output from the check

## Usage
```bash
node tmp/check-i18n.js
```

## Conventions
- Maintenance scripts only.
- No application code here.
- Prefer short-lived helpers that can be deleted after use.

## Commit Attribution
AI-authored commits MUST include:
`Co-authored-by: Gemini CLI <agent@gemini.google.com>`
