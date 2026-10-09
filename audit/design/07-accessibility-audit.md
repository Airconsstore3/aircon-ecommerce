# 07 — Accessibility Audit (WCAG 2.2 AA)

Code-level audit (no live screen-reader run; items marked [ASSUMPTION] need device verification).

## Critical failures

### A11Y-01 — Unstoppable auto-playing hero carousel · WCAG 2.2.2 (Pause, Stop, Hide) · **Critical**
`src/components/hero-section.tsx:203-210`: `Autoplay({ delay:5000, stopOnInteraction:false, stopOnMouseEnter:false, stopOnFocusIn:false })`. The carousel animates every 5s forever; there is no pause/stop control and focus/hover does not halt it. This fails 2.2.2 outright and is a vestibular/cognitive hazard.
**Fix:** add a visible pause/play button (`aria-pressed`), stop on hover/focus, respect `prefers-reduced-motion` by disabling autoplay entirely.

### A11Y-02 — CartDrawer is not a dialog · WCAG 4.1.2 · **Critical**
`src/components/shop/CartDrawer.tsx`: rendered as a raw `<div>` + backdrop `<div onClick>`. Missing: `role="dialog"`, `aria-modal="true"`, accessible name (`aria-labelledby` → "Shopping Cart"), focus trap, Escape-to-close, focus return to the trigger. Focus can escape behind the overlay; screen readers get no dialog announcement.
**Fix:** rebuild on `Sheet` (Radix) which provides all of the above — the project already ships it.

### A11Y-03 — Contrast failures on primary blue · WCAG 1.4.3 · **High**
`#1C99D6` on `#FFFFFF` ≈ **3.0:1**; white on `#1C99D6` ≈ **3.0:1**.
Used for: 14px links (CartDrawer "Continue Shopping"), PDP price text (24px bold — borderline pass at 3:1 for large text), all `bg-[#1C99D6] text-white` CTAs at 14–15px (**fail**), footer hover links, PLP toolbar white text on blue (large-ish, borderline).
`#9CA3AF` on white ≈ **2.5:1** — footer legal links, cart trash icon, muted meta.
**Fix:** darken interactive blue to ≈`#0E7BB0` (≥4.5:1 on white) for text/small elements; keep `#1C99D6` for large/display only; replace `#9CA3AF` text with `#5F6B7A`.

### A11Y-04 — No `prefers-reduced-motion` support · WCAG 2.3.3 intent · **High**
Zero matches for `prefers-reduced-motion` / `motion-safe` / `motion-reduce` across `src/`. Carousel autoplay, `transition-all duration-500/700` reveals, angled-button background-position animations all run for motion-sensitive users.
**Fix:** global `@media (prefers-reduced-motion: reduce)` kill-switch + `motion-reduce:` variants on animated components.

## High failures

### A11Y-05 — Icon buttons without accessible names · WCAG 4.1.2 · **High**
- Nav `SearchForm` button — no `aria-label` (also dead).
- Mobile nav search button — no `aria-label`.
- PLP grid-toggle buttons (`ProductsClient.tsx:249-270`) — no `aria-label`/`aria-pressed`.
- Cart page remove button (`cart/page.tsx:110-116`) — no `aria-label` (the drawer version has one — inconsistent).
- Password visibility toggles (`login-form.tsx:66-84`) — no `aria-label`/`aria-pressed`.
**Fix:** label every icon-only control; add `aria-pressed` to toggles.

### A11Y-06 — Star rating has no accessible name · WCAG 1.1.1 · **Medium-High**
`ProductDetailClient.tsx:1117` renders `★★★★☆` unicode + `4.9` + "5.8k Reviews". Screen readers announce five symbol characters. Wrap in `role="img" aria-label="Rated 4.9 out of 5 from 5,800 reviews"`.

### A11Y-07 — Form error handling · WCAG 3.3.1/3.3.3 · **Medium-High**
Checkout: no `aria-invalid`, no `aria-describedby` error association, server errors render as a single `<p>` banner without `role="alert"` or focus move. Login does use `role="alert"` ✓ (inconsistent).
**Fix:** per-field errors with `aria-invalid`+`aria-describedby`, error summary with focus management on submit fail.

### A11Y-08 — Variant selector groups unlabeled · **Medium**
PDP "Available Sizes"/attribute chips are `<button>`s inside a plain `<div>` with a `<label>` caption that isn't programmatically associated. Use `role="radiogroup"` + `role="radio" aria-checked` (the install toggle already does this — copy that pattern), or `fieldset/legend`.

## Medium / advisory

| ID | Item | Note |
|---|---|---|
| A11Y-09 | Focus styles on raw controls | checkout `<select>`s, `<a>` links, raw `<button>`s lack visible focus — only shadcn primitives have rings |
| A11Y-10 | Touch targets | `size-9`/`size-6` icon buttons = 36/24px < 44×44 guidance (WCAG 2.5.8 AA minimum is 24×24 — technically passes AA but below best practice) |
| A11Y-11 | `pt-[220px]` layout | not an a11y fail per se, but pushes h1 far down; combined with 128px sticky header, reflow at 200% zoom is tight [ASSUMPTION — verify] |
| A11Y-12 | Skip link | no "Skip to content" link anywhere |
| A11Y-13 | Landmark structure | `main` wraps content ✓ in root & shop layout; nav in `header` ✓; footer `footer` ✓ (when present); drawer nav uses `<nav>` inside Sheet ✓ |
| A11Y-14 | Alt text | product images get names ✓; check decorative hero overlay images use `alt=""` vs descriptive |
| A11Y-15 | `html lang="en"` ✓; consider `en-ZA` | minor |
| A11Y-16 | Heading order | global `!important` h1/h2/h3 sizing is visual, not structural — but PLP has two h1s (hero "All Aircons" + toolbar "Products") — **two h1s on one page** → Moderate |
| A11Y-17 | Fake pagination buttons | focusable, do nothing — keyboard users activate dead controls |
| A11Y-18 | Consent-disabled submit | `disabled` with no explanation — WCAG allows but poor practice; add `aria-describedby` hint |
| A11Y-19 | Color-only status | stock dot + text label ✓; payment badges = color+label ✓; PASS |
| A11Y-20 | Carousel dots/arrows | hero carousel has chevron buttons — check aria-labels [ASSUMPTION: embla defaults unlabeled] |

## Passes worth noting

- `role="radiogroup"`/`aria-checked` on installation toggle (PDP).
- `aria-label` on CartDrawer close/remove/qty buttons.
- `role="alert"` on login error; `aria-invalid` rings baked into shadcn Input/Button.
- Radix primitives (Sheet, Dialog, Accordion, NavMenu) inherit correct semantics.
- Labels + `htmlFor` on all checkout/login inputs.
- Stock status conveyed via text, not color alone.
- `sr-only` SheetTitle in mobile drawers.

## Compliance summary

| WCAG area | Status |
|---|---|
| Perceivable | FAIL (contrast, autoplay, rating name) |
| Operable | FAIL (no pause, no Esc on drawer, dead controls, no skip link) |
| Understandable | PARTIAL (error handling, disabled-state hints) |
| Robust | PARTIAL (dialog semantics, unlabeled controls) |
| **Verdict** | **Not AA-conformant; ~4 Critical/High remediations required** |
