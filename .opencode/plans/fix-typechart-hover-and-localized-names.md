# Fix Plan: TypeChart Hover Trembling + Localized Pokémon Names

## Bug 1: Hover Trembling on TypeChart Cells

### Problem
When hovering border cells of the type effectiveness table and moving the mouse toward type names, a trembling/flickering effect occurs. This is caused by:

1. **`scale-105` transform on column headers** (`TypeChart.tsx:154`): When a type is highlighted, the `<th>` element scales up, changing its bounding box. This causes the mouse to potentially leave/re-enter adjacent cells rapidly, creating a feedback loop of `onMouseEnter`/`onMouseLeave` events.

2. **Per-cell `onMouseLeave` handler** (`TypeChart.tsx:211`): Each cell individually fires `onMouseLeave` when the mouse moves even 1px toward a neighbor. When combined with the `scale-105` transform shifting layout, this creates a rapid toggle.

### Fix (2 changes in `src/components/pokemon/TypeChart.tsx`)

**Change 1 — Remove `scale-105` from column headers (line ~154):**
```
// BEFORE:
isHighlighted(defType) && 'scale-105'

// AFTER:
isHighlighted(defType) && 'bg-white/10 rounded-lg'
```
The `scale-105` transform changes the element's visual size without changing layout, but it can still cause hit-area issues. Remove it entirely — the `bg-white/10` background highlight is sufficient visual feedback.

**Change 2 — Move `onMouseLeave` from individual cells to `<tbody>` (lines ~207-211):**
```
// BEFORE (on each <td>):
<td
  key={defType}
  className="p-[1px] md:p-0.5"
  onMouseEnter={() => handleCellHover(atkType, defType)}
  onMouseLeave={handleCellLeave}
>

// AFTER:
<td
  key={defType}
  className="p-[1px] md:p-0.5"
  onMouseEnter={() => handleCellHover(atkType, defType)}
>
```
And add `onMouseLeave={handleCellLeave}` to the `<tbody>` element instead. This way, the hover state only clears when the mouse actually leaves the entire table body, not when it moves between adjacent cells.

---

## Bug 2: Localized Pokémon Names on /types Page

### Problem
The "Emblematic Pokémon" section at `src/app/types/page.tsx:196` displays `{p.name}` which is the English identifier from the GraphQL API. However, the API already returns localized names via `pokemon_v2_pokemonspeciesnames` — they're just not being used.

### Data Already Available
The `PokemonBasicData` type already includes:
```typescript
pokemon_v2_pokemonspecy: {
  pokemon_v2_pokemonspeciesnames: {
    name: string;
    pokemon_v2_language: { name: string };
  }[];
} | null;
```

The i18n system maps language codes: `fr` → French, `es` → Spanish, etc.

### Fix (2 changes in `src/app/types/page.tsx`)

**Change 1 — Add a helper function to extract localized name:**

Add a utility function (or inline logic) to get the localized name from the species data, falling back to `p.name` (English) if the current language isn't available:

```typescript
function getLocalizedPokemonName(
  pokemon: PokemonBasicData,
  currentLang: string
): string {
  const species = pokemon.pokemon_v2_pokemonspecy;
  if (!species?.pokemon_v2_pokemonspeciesnames?.length) return pokemon.name;
  
  const localized = species.pokemon_v2_pokemonspeciesnames.find(
    (n) => n.pokemon_v2_language.name === currentLang
  );
  return localized?.name || pokemon.name;
}
```

**Change 2 — Use localized name in the emblematic Pokémon section (line ~196):**

```typescript
// BEFORE:
<span className="font-black capitalize text-base group-hover:text-primary transition-colors">{p.name}</span>

// AFTER:
<span className="font-black capitalize text-base group-hover:text-primary transition-colors">
  {getLocalizedPokemonName(p, i18n.language)}
</span>
```

Need to import `i18n` from `@/lib/i18n` at the top of the file.

**Note on `capitalize` class:** Some languages (like Japanese, Korean) don't use capitalization. The `capitalize` Tailwind class only affects Latin scripts, so it's harmless for CJK languages. However, the localized names from the API are already properly cased, so we should remove `capitalize` to avoid any issues:

```typescript
// AFTER (better):
<span className="font-black text-base group-hover:text-primary transition-colors">
  {getLocalizedPokemonName(p, i18n.language)}
</span>
```

### Additional consideration
The `i18n.language` value needs to be reactive. Since the page is a client component with `useTranslation()`, we can use the `i18n` instance directly from the hook or import. The `useTranslation` hook returns `{ t, i18n }`, so we can use:

```typescript
const { t, i18n } = useTranslation();
```

Then pass `i18n.language` to the helper function.

---

## Files to Modify

| File | Change |
|------|--------|
| `src/components/pokemon/TypeChart.tsx` | Remove `scale-105` from column headers, move `onMouseLeave` to `<tbody>` |
| `src/app/types/page.tsx` | Extract localized name from species data, use in emblematic Pokémon display |

## Testing

1. **Bug 1:** Hover border cells of the type chart, move mouse toward row/column headers — no trembling should occur
2. **Bug 2:** Switch language to French, verify Pokémon names in "Pokémon emblématiques" section display in French (e.g., "Dracaufeu" instead of "Charizard"). Test with other languages too.
