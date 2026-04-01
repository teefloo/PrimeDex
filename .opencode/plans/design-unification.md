# Design Unification Plan — PrimeDex

## Executive Summary

The site has a strong design foundation (aurora mesh, glassmorphism, dark-mode-first, framer-motion). 
The goal is to unify inconsistencies across pages without changing the overall aesthetic direction.

---

## Phase 1: Create Shared Components

### 1.1 `src/components/layout/SiteFooter.tsx` (NEW)
Extract the duplicated footer from `app/page.tsx` and `app/favorites/page.tsx` into a reusable component.

```tsx
import { useTranslation } from '@/lib/i18n';

export default function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.04]">
      <div className="py-16 text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/20" />
          <span className="text-lg font-black gradient-text-primary tracking-tighter">PrimeDex</span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/20" />
        </div>
        <p className="text-[11px] font-semibold text-foreground/25 tracking-wider">
          {t('home.footer_copyright', { year: new Date().getFullYear() })}
        </p>
        <p className="mt-3 text-[10px] text-foreground/15 tracking-wide">
          {t('home.footer_data')}
        </p>
      </div>
    </footer>
  );
}
```

### 1.2 `src/components/layout/PageHeader.tsx` (NEW)
Standardize page headers with consistent icon box, title, subtitle, and gradient divider.

```tsx
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  icon: LucideIcon;
  title: string;
  subtitle?: string;
  badge?: React.ReactNode;
  className?: string;
  iconBgColor?: string;    // e.g. "bg-rose-500/10"
  iconBorderColor?: string; // e.g. "border-rose-500/15"
  iconColor?: string;       // e.g. "text-rose-400"
  gradientFrom?: string;    // e.g. "from-rose-500/20"
  centered?: boolean;
}

export default function PageHeader({
  icon: Icon, title, subtitle, badge, className,
  iconBgColor = 'bg-primary/10',
  iconBorderColor = 'border-primary/20',
  iconColor = 'text-primary',
  gradientFrom = 'from-primary/20',
  centered = false,
}: PageHeaderProps) {
  return (
    <section className={cn('mb-12 pt-14', centered && 'text-center', className)}>
      <div className="relative mb-8">
        <div className={cn('absolute top-0 right-0 w-[300px] h-[200px] rounded-full blur-[100px] pointer-events-none', gradientFrom)} />
        <div className={cn('flex items-center gap-5', centered && 'justify-center')}>
          <div className={cn('p-4 rounded-2xl border backdrop-blur-xl', iconBgColor, iconBorderColor)}>
            <Icon className={cn('w-8 h-8', iconColor)} />
          </div>
          <div>
            <h2 className="text-4xl md:text-5xl font-black text-foreground tracking-tighter">{title}</h2>
            {subtitle && (
              <p className="text-foreground/30 font-bold uppercase tracking-[0.2em] text-[10px] mt-1.5">{subtitle}</p>
            )}
          </div>
          {badge}
        </div>
      </div>
      <div className={cn('h-px w-full bg-gradient-to-r', gradientFrom, 'via-white/[0.04] to-transparent')} />
    </section>
  );
}
```

### 1.3 `src/components/ui/TypeBadge.tsx` (NEW)
Unify type badge usage across all pages (replaces inline glass-tag patterns).

```tsx
import { TYPE_COLORS } from '@/types/pokemon';
import { cn } from '@/lib/utils';

interface TypeBadgeProps {
  type: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TypeBadge({ type, size = 'md', className }: TypeBadgeProps) {
  const color = TYPE_COLORS[type] || '#A8A77A';
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[8px]',
    md: 'px-3 py-1 text-[10px]',
    lg: 'px-4 py-1.5 text-xs',
  };

  return (
    <span
      className={cn(
        'glass-tag inline-block',
        sizeClasses[size],
        className
      )}
      style={{ backgroundColor: `${color}cc`, borderColor: color }}
    >
      {type}
    </span>
  );
}
```

### 1.4 `src/components/ui/EmptyState.tsx` (NEW)
Standardize empty/zero-data states across all pages.

```tsx
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export default function EmptyState({
  icon: Icon, title, description, actionLabel, actionHref, onAction, className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className={cn(
        'flex flex-col items-center justify-center py-32 text-foreground/50 glass-panel rounded-[2rem] max-w-2xl mx-auto border-dashed border border-white/[0.06]',
        className
      )}
    >
      <div className="p-6 bg-white/[0.03] rounded-full mb-6">
        <Icon className="w-16 h-16 text-foreground/20" />
      </div>
      <h3 className="text-2xl font-black mb-2 text-foreground/70 tracking-tight">{title}</h3>
      <p className="text-sm text-foreground/40 font-medium mb-8 text-center px-6 max-w-md">{description}</p>
      {actionLabel && actionHref && (
        <Link href={actionHref}>
          <button className="glass-btn px-8 py-4 flex items-center gap-2 hover:scale-105 transition-all">
            <span className="font-black uppercase tracking-[0.15em] text-sm">{actionLabel}</span>
          </button>
        </Link>
      )}
      {actionLabel && onAction && (
        <button onClick={onAction} className="glass-btn px-8 py-4 flex items-center gap-2 hover:scale-105 transition-all">
          <span className="font-black uppercase tracking-[0.15em] text-sm">{actionLabel}</span>
        </button>
      )}
    </motion.div>
  );
}
```

---

## Phase 2: Standardize CSS Design Tokens

### 2.1 `src/app/globals.css` — Add unified design tokens

Add these to the `:root` and `.dark` blocks:

```css
/* Add to :root */
--radius-card: 2rem;
--radius-panel: 2.5rem;
--radius-pill: 9999px;
--radius-inner: 1.5rem;

--space-section: 3rem;
--space-page-top: 3.5rem;
--space-card-gap: 1.5rem;

--shadow-card: 0 8px 32px rgba(0, 0, 0, 0.06), inset 0 1px 0 var(--glass-shine);
--shadow-card-hover: 0 20px 60px -12px rgba(0, 0, 0, 0.12), inset 0 1px 0 var(--glass-shine);
--shadow-dark-card: 0 8px 32px rgba(0, 0, 0, 0.4), inset 0 1px 0 var(--glass-shine);
--shadow-dark-card-hover: 0 20px 60px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 var(--glass-shine);

--transition-smooth: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
--transition-spring: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);

/* Add to .dark */
--radius-card: 2rem;
--radius-panel: 2.5rem;
--radius-pill: 9999px;
--radius-inner: 1.5rem;
```

### 2.2 Add utility classes for consistent rounding

```css
.rounded-card { border-radius: var(--radius-card); }
.rounded-panel { border-radius: var(--radius-panel); }
.rounded-inner { border-radius: var(--radius-inner); }
```

---

## Phase 3: Page-by-Page Updates

### 3.1 `app/page.tsx` — Home
- Replace inline footer with `<SiteFooter />`
- No other changes needed (already well-designed)

### 3.2 `app/favorites/page.tsx`
- Replace inline footer with `<SiteFooter />`
- Replace inline header with `<PageHeader icon={Heart} ... />`
- Replace inline empty state with `<EmptyState icon={Ghost} ... />`
- Remove `FavoriteButton` wrapper component (use raw button or shadcn Button)

### 3.3 `app/team/page.tsx`
- Add `<SiteFooter />` at bottom
- Replace inline header with `<PageHeader icon={Users} ... />`
- Standardize all `rounded-3xl` → `rounded-[2rem]` for cards
- Standardize all `rounded-[2.5rem]` → `rounded-[2.5rem]` (keep for panels)
- Replace inline type tags with `<TypeBadge />`
- Standardize `Trash2CustomIcon` → use `Trash2` from lucide-react

### 3.4 `app/compare/page.tsx`
- Add `<SiteFooter />` at bottom
- Replace inline header with `<PageHeader icon={Scale} ... />`
- Replace inline empty state with `<EmptyState icon={Scale} ... />`
- Standardize all `rounded-[3rem]` → `rounded-[2.5rem]` for panels
- Standardize all `rounded-3xl` → `rounded-[2rem]` for cards
- Replace inline type tags with `<TypeBadge />`

### 3.5 `app/types/page.tsx`
- Add `<SiteFooter />` at bottom
- Replace inline header with `<PageHeader icon={Target} ... />`
- Standardize all `rounded-[3rem]` → `rounded-[2.5rem]` for panels
- Standardize all `rounded-3xl` → `rounded-[2rem]` for cards

### 3.6 `app/quiz/page.tsx`
- Add `<SiteFooter />` at bottom
- Standardize native `<select>` elements to use glass styling (add `appearance-none` + custom arrow)
- Standardize all `rounded-[3rem]` → `rounded-[2.5rem]` for panels
- Standardize all `rounded-2xl` → `rounded-[2rem]` for cards
- Standardize button sizes and variants

### 3.7 `app/pokemon/[name]/PokemonDetailClient.tsx`
- Standardize all `rounded-[2.5rem]` → use consistent `rounded-panel` class
- Standardize all `rounded-2xl` → `rounded-[2rem]`
- No structural changes needed (already well-designed)

---

## Phase 4: Component Consistency

### 4.1 Button Standardization
**Affected**: `quiz/page.tsx`, `team/page.tsx`, `compare/page.tsx`, `favorites/page.tsx`

Rule: Use shadcn `<Button>` for all primary actions. Use `.glass-btn` class only for decorative/secondary buttons.

### 4.2 Select Element Styling
**Affected**: `quiz/page.tsx:395-407`

Replace native `<select>` with styled version:
```tsx
<select className="w-full h-12 rounded-[2rem] bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] px-4 text-sm font-bold appearance-none cursor-pointer focus:border-primary/30 transition-all">
```

### 4.3 Type Tag Standardization
**Affected**: `team/page.tsx:288-292`, `compare/page.tsx:308-311`, `types/page.tsx`

Replace all inline type tag patterns with `<TypeBadge>` component or the `glass-tag` CSS class consistently.

### 4.4 Card Rounding Standardization
Global rule:
- **Glass panels** (main content containers): `rounded-[2.5rem]`
- **Cards** (pokemon cards, stat cards): `rounded-[2rem]`
- **Inner elements** (buttons, badges): `rounded-xl` or `rounded-full`
- **Pill elements** (tags, chips): `rounded-full`

### 4.5 Section Divider Standardization
All pages use this pattern for section dividers:
```tsx
<div className="h-px w-full bg-gradient-to-r from-primary/20 via-white/[0.04] to-transparent" />
```

### 4.6 Empty State Standardization
All empty/zero-data states use the `<EmptyState>` component with:
- Glass panel container
- Icon in circular bg
- Title + description
- Optional CTA button

---

## File Change Summary

| File | Action | Changes |
|------|--------|---------|
| `src/components/layout/SiteFooter.tsx` | CREATE | New shared footer component |
| `src/components/layout/PageHeader.tsx` | CREATE | New shared page header component |
| `src/components/ui/TypeBadge.tsx` | CREATE | New type badge component |
| `src/components/ui/EmptyState.tsx` | CREATE | New empty state component |
| `src/app/globals.css` | EDIT | Add design tokens (radius, spacing, shadows) |
| `src/app/page.tsx` | EDIT | Use SiteFooter |
| `src/app/favorites/page.tsx` | EDIT | Use SiteFooter, PageHeader, EmptyState |
| `src/app/team/page.tsx` | EDIT | Add SiteFooter, standardize rounding, use TypeBadge |
| `src/app/compare/page.tsx` | EDIT | Add SiteFooter, use PageHeader, EmptyState, TypeBadge |
| `src/app/types/page.tsx` | EDIT | Add SiteFooter, standardize rounding |
| `src/app/quiz/page.tsx` | EDIT | Add SiteFooter, style selects, standardize rounding |
| `src/app/pokemon/[name]/PokemonDetailClient.tsx` | EDIT | Standardize rounding |
