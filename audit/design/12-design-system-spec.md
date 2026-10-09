# 12 — Design System Specification (To-Be Tokens)

Tailwind v4 CSS-first. Replace the `:root` + `@theme inline` blocks in `globals.css` with the following. All commerce hex values get codemod'd to these tokens.

## Color tokens

```css
@theme {
  /* Brand */
  --color-navy-50:  #EEF3F8;
  --color-navy-100: #D8E3EE;
  --color-navy-700: #16324F;
  --color-navy-800: #0A2540;   /* primary ink */
  --color-navy-900: #071B2E;
  --color-blue-50:  #F0F9FF;
  --color-blue-100: #D7F0FC;
  --color-blue-200: #B8E3F7;
  --color-blue-500: #1C99D6;   /* brand — large/fill only */
  --color-blue-600: #0E7BB0;   /* interactive — AA-safe on white */
  --color-blue-700: #0B6694;

  /* Semantic */
  --color-success:        #0F834D;
  --color-success-surface:#E6F4EC;
  --color-warning:        #B45309;
  --color-warning-surface:#FDF3E4;
  --color-danger:         #DC2626;
  --color-danger-surface: #FDECEC;
  --color-info:           #0E7BB0;
  --color-info-surface:   #F0F9FF;

  /* Neutral (single ramp) */
  --color-gray-50:  #F8FAFB;
  --color-gray-100: #F1F4F7;
  --color-gray-200: #E5E9EE;   /* default border */
  --color-gray-300: #CBD3DC;
  --color-gray-400: #8A94A3;
  --color-gray-500: #5F6B7A;   /* secondary text — 4.9:1 */
  --color-gray-700: #374151;
  --color-gray-900: #111827;

  /* shadcn semantic aliases */
  --color-background: #FFFFFF;
  --color-foreground: var(--color-navy-800);
  --color-primary: var(--color-blue-600);        /* AA-safe default */
  --color-primary-foreground: #FFFFFF;
  --color-primary-display: var(--color-blue-500);/* marketing only */
  --color-secondary: var(--color-blue-100);
  --color-secondary-foreground: var(--color-navy-800);
  --color-muted: var(--color-gray-100);
  --color-muted-foreground: var(--color-gray-500);
  --color-accent: var(--color-blue-50);
  --color-accent-foreground: var(--color-navy-800);
  --color-destructive: var(--color-danger);
  --color-destructive-foreground: #FFFFFF;
  --color-border: var(--color-gray-200);
  --color-input: var(--color-gray-300);
  --color-ring: var(--color-blue-600);
  --color-card: #FFFFFF;
  --color-card-foreground: var(--color-navy-800);
  --color-popover: #FFFFFF;
  --color-popover-foreground: var(--color-navy-800);
}
```

**Retired:** all Relume `--color-*-primary/tertiary/alternative` tokens, `#1E3A5F`, `#2599d4`, `#1680b0`, `#1597c6`, `#58585A`, `#9CA3AF`, `#6B7280`, `#A0A0A0`, `#FAFAF9`, `#111111`, `#E1E5EA`, `#F0F0F0`, `#EAEAEA`, `#E5E5E5`, `#F5F5F5`, `#F1F8FC`, `#FFA500` (→ `amber-500`).

## Typography tokens

```css
@theme {
  --font-sans: Inter, system-ui, sans-serif;
  --font-display: var(--font-google-sans-flex), Inter, system-ui, sans-serif;
  /* delete --font-poppins */

  --text-display: 3.5rem;  --text-display-lh: 1.02;   /* 56 — home heroes only */
  --text-h1: 2.5rem;       --text-h1-lh: 1.1;         /* 40 (was 72!) */
  --text-h2: 2rem;         --text-h2-lh: 1.15;        /* 32 */
  --text-h3: 1.5rem;       --text-h3-lh: 1.2;         /* 24 */
  --text-h4: 1.25rem;      --text-h4-lh: 1.25;        /* 20 */
  --text-body-lg: 1.125rem;--text-body-lg-lh: 1.6;
  --text-body: 1rem;       --text-body-lh: 1.6;
  --text-small: 0.875rem;  --text-small-lh: 1.45;
  --text-caption: 0.75rem; --text-caption-lh: 1.35;
  --text-overline: 0.6875rem; /* 11 — nav/eyebrow, uppercase +0.08em */
}
```

**Rules:** No `!important` type overrides — delete `main h1/h2/h3` rules, `.homepage-typography` block, PDP inline `<style>`. Elements map: h1→`text-h1 font-display font-semibold`, section titles→h2, card titles→h4, nav links→`text-small` (13px min), meta/captions→`text-caption`, prices→`text-h3 font-display`.

## Spacing

Tailwind default (4px). Semantic aliases: `--space-section: 4rem`(64) mobile / `6rem` desktop; `--space-gutter: 1rem/1.5rem/2rem` responsive; `--container: 80rem` (1280px).

## Radius

```css
@theme {
  --radius-sm: 0.25rem;  /* chips, small inputs (was rounded-[4px]) */
  --radius:    0.5rem;   /* buttons, inputs, cards default */
  --radius-lg: 0.75rem;  /* modals, drawers, panels */
  --radius-xl: 1rem;     /* hero cards */
  --radius-pill: 9999px; /* badges, dots, toggles */
}
```
**Rule:** commerce CTAs/inputs use `--radius` (stop the `rounded-none` fork); angled motif becomes a `clip-path`/pseudo-element accent on `.btn-brand`, not a radius change.

## Elevation

```css
@theme {
  --shadow-1: 0 1px 2px rgb(10 37 64 / 0.06);              /* cards, nav */
  --shadow-2: 0 4px 12px rgb(10 37 64 / 0.10);             /* sticky bars, popovers */
  --shadow-3: 0 12px 32px rgb(10 37 64 / 0.16);            /* drawers, modals */
  --shadow-focus: 0 0 0 3px rgb(14 123 176 / 0.35);        /* focus ring */
}
```

## Z-index scale

```css
@theme {
  --z-base: 0; --z-sticky: 20; --z-nav: 40; --z-overlay: 50;
  --z-drawer: 60; --z-modal: 70; --z-toast: 80; --z-tooltip: 90;
}
```
Kills the z-40/z-50/z-[60]/z-[70] collisions (cart backdrop currently ties nav at 60).

## Breakpoints

Tailwind defaults: sm 640, md 768, lg 1024, xl 1280, 2xl 1536. Container maxes at 1280.

## Motion

```css
@theme {
  --dur-fast: 120ms; --dur-base: 200ms; --dur-slow: 350ms;
  --ease-out: cubic-bezier(.22,.61,.36,1);
  --ease-inout: cubic-bezier(.45,0,.2,1);
}
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration:.01ms!important; transition-duration:.01ms!important; }
}
```

## Header

`--header-h: 3.5rem` mobile / `4.5rem` desktop — single var; pages pad via `pt-[calc(var(--header-h)+2rem)]` or a `PageShell` component.

## Signature element: angled-corner accent

Formalise `.aircon-angled-button` as `BrandButton` variant `angled`: keep the dual-corner frame + diagonal navy slide on hover (existing implementation is good), apply to: hero primary CTA, PDP "Add to cart", checkout submit, active-nav indicator. Everywhere else uses standard `Button`. This gives the brand one ownable detail used consistently at high-intent moments.
