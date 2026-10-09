# 13 — Component Specifications

Format: `DS-{CATEGORY}-{NUMBER}`. Only deltas vs existing shadcn primitives are spec'd in full; primitives get usage rules.

---

DS-ACTION-001
Name: Button (extends shadcn `button.tsx`)
Purpose: All actions. Commerce code must not override color/radius via className.
Variants: `primary` (blue-600 bg, white text, hover blue-700), `secondary` (blue-100 bg, navy text), `outline` (gray-300 border, navy text), `ghost`, `destructive`, `link` (blue-600), `angled` (brand signature — dual-corner frame + navy slide; reserved for hero/PDP/checkout primary actions only)
Sizes: `sm` h-9 px-4 text-small · `default` h-11 px-5 text-small semibold · `lg` h-12 px-6 · `icon` 44px square · `icon-sm` 36px (desktop only)
States: default / hover (darken 8%) / focus-visible (`shadow-focus` ring) / active (translate-y-px) / disabled (opacity-50 + `cursor-not-allowed` + `aria-describedby` reason hint when gating) / loading (Lucide `Loader2` spin + label preserved, `aria-busy`)
Anatomy: [icon-start?] label [icon-end?]
Accessibility: min 44×44 mobile; `aria-label` required when icon-only; loading keeps accessible name.
Usage: `<Button variant="angled" size="lg">Add to cart</Button>`
Do: one primary/angled per viewport section.
Don't: `className="bg-[#1C99D6] rounded-none"` — variant overrides are a code-review violation.

DS-ACTION-002
Name: IconButton
Purpose: Icon-only actions (cart, search, wishlist, close).
Variants: ghost, outline, solid-navy. Sizes: `md` 44px, `sm` 36px (desktop only).
States: + badge slot (count) for cart.
Accessibility: `aria-label` MANDATORY; badge count announced via `aria-label="Cart, 3 items"`.
Don't: render without aria-label (current SearchForm, grid toggles, cart trash fail this).

DS-ACTION-003
Name: Link / NavLink
Purpose: Inline and nav links.
Variants: inline (blue-600, underline on hover), nav (navy-800, text-small medium, underline-slide hover — keep existing pattern), footer (gray-500→blue-600).
States: + `aria-current="page"` active state (3px blue bar, per mobile drawer pattern).
Accessibility: focus ring; nav min 13px.

---

DS-FORM-001
Name: Input
Purpose: Text entry.
Variants: default (gray-300 border → ring on focus), `invalid` (danger border + ring).
Sizes: `default` h-11 px-3 text-body (mobile 16px to prevent iOS zoom) · `lg` h-12.
States: hover (border gray-400) / focus / disabled (gray-100 bg) / invalid.
Accessibility: `aria-invalid` + `aria-describedby` → error id.
Don't: `rounded-none h-[46px]` overrides (current checkout).

DS-FORM-002
Name: Textarea — same tokens; `min-h-24`, resize-y only.

DS-FORM-003
Name: Select
Purpose: Use shadcn `Select` (Radix) everywhere — **replace raw `<select>`s in checkout** (province, contact channel).
Same states/height as Input; searchable variant for provinces optional.

DS-FORM-004/005/006
Name: Checkbox / Radio / Switch
Checkbox: shadcn ✓ — keep; ensure `aria-describedby` for consent hints.
Radio: use `radio-group` primitive for payment methods (replace hand-rolled inputs) inside `PaymentMethodCard`.
Switch: for binary settings in account (marketing opt-in). 44px target.

DS-FORM-007
Name: FormField (wrap shadcn `field.tsx`)
Purpose: Label + control + help + error unit.
Anatomy: `<Label>` (text-small, navy) / control / help text (text-caption gray-500) / error (text-caption danger + icon, `role="alert"`).
Rules: every checkout field uses FormField with react-hook-form + zod resolver (already installed); submit-fail focuses error summary (`role="alert"`, `tabIndex=-1`).

DS-FORM-008
Name: SegmentedControl
Purpose: No/Yes binary choices (installation toggle pattern — already a11y-correct).
Anatomy: `role="radiogroup"` + buttons `role="radio" aria-checked`; selected = blue-600 solid.
Reuse for: delivery/pickup, enquiry vs buy.

---

DS-DISPLAY-001
Name: Card
Variants: `default` (white, gray-200 border, radius, shadow-1), `interactive` (hover shadow-2 + translate-y-[-2px]), `surface` (gray-50 bg, no border).
Don't: `border-0` + `rounded-2xl` forks (auth cards → `radius-lg`).

DS-DISPLAY-002
Name: ProductCard (single canonical — replaces shop/ProductCard + dead variants)
Anatomy: 1:1 image (next/image, lazy) / brand overline / name (2-line clamp, h4) / spec bullets (≤4, text-caption) / price row (Price + optional compare-at strike + "-15%" Badge) / stock chip / rating row / CTA (Add to cart or "View options" when variants).
Variants: `grid` (PLP), `compact` (recommendations/cart drawer), `deal` (countdown timer).
States: default / hover (image scale 1.02 + shadow-2) / sold-out (badge + CTA→"Notify me") / enquiry (price → "Price on request").
Accessibility: whole-card link pattern (stretched-link on name only; CTA separate stopProp); stock conveyed by text not color.
Don't: countdown timers without `aria-live="off"` + static deadline text fallback.

DS-DISPLAY-003
Name: Badge / Tag / Chip
Badge: pill, text-caption semibold — variants: `sale` (danger surface/text), `new` (blue-100/navy), `stock-low` (warning), `stock-out` (gray), `status-*` (order payment statuses — formalise order-confirmed's 6 ad-hoc colors: pending=warning, processing=info, paid=success, failed=danger, cancelled=gray, refunded=navy).
Chip (selectable): radius-sm, border gray-300 → selected blue-600 solid; disabled = line-through + gray. **This is the PDP variant selector pattern — extract it.**

DS-DISPLAY-004
Name: Price
Purpose: THE money component — replace 3 competing formatters.
Anatomy: `From `? + `R 12 999` (font-display semibold) + compare-at (gray-400 strike, text-small) + save-badge.
Sizes: `card` text-h4, `pdp` text-h3, `summary` text-small.
Format: `formatZAR` → `R\u00A012\u202F999`; enquiry → "Price on request".
A11y: `<span aria-label="12,999 rand">` optional for SR clarity.

DS-DISPLAY-005
Name: Rating
Anatomy: 5 Lucide Stars (amber-500 fill to rating) + `4.9` + `(5.8k)` link.
A11y: `role="img" aria-label="Rated 4.9 out of 5 from 5,800 reviews"` — replaces unicode `★☆`.
Sizes: `sm` (card), `md` (PDP).

DS-DISPLAY-006
Name: CartLineItem
Anatomy: 80px thumb / name+variant meta / qty Stepper / line price / remove IconButton (aria-label "Remove {name}").
Used in: CartDrawer + cart page + checkout summary (read-only variant).

DS-DISPLAY-007
Name: OrderSummary
Anatomy: line items (compact) / breakdown rows (Subtotal, Installation, Kit, Maintenance, Warranty, **Delivery** ← new) / Total (text-h4) / trust row (payment icons + "Secure checkout" + returns link).
Sticky on desktop; collapsible accordion on mobile with sticky total+CTA bar.
Rule: identical math/labels in cart, checkout, confirmation (already close — formalise).

DS-DISPLAY-008
Name: Table
Use shadcn table for account orders/admin; mobile → stacked cards below md.

---

DS-OVERLAY-001
Name: Modal (shadcn Dialog)
Rules: `aria-labelledby` title, focus trap (Radix free), `max-w-lg` default; kit/maintenance configurators → `max-w-2xl` with sticky footer CTA.

DS-OVERLAY-002
Name: Drawer (shadcn Sheet) — **rebuild CartDrawer on this**
CartDrawer spec: side=right, `role="dialog" aria-modal` automatic, Esc closes, focus returns to cart button; sections: header (title+count+close) / items scroll / recommendations / footer (subtotal+CTA+continue).
MobileMenu drawer: keep existing dark navy-800 design — it's the best mobile surface; just tokenize `#16324F`→navy-800.

DS-OVERLAY-003
Name: Toast (sonner — already mounted, **start using it**)
Triggers: add-to-cart ("Added — View cart" action), remove, form errors (non-checkout), address saved, OAuth errors.
Variants: success/info/warning/error (`richColors` already on). Position bottom-right ✓; `duration 4000`; action button support.

DS-OVERLAY-004
Name: Alert / Banner
Inline: info (info-surface), warning, danger — icon + text-small + optional action. Top-of-page Banner for promotions (replaces hardcoded `bg-[#1C99D6]` strip).

---

DS-NAV-001
Name: Tabs — shadcn ✓ (PDP info tabs already use it).

DS-NAV-002
Name: Accordion — shadcn ✓; used for filters, PDP sections, mobile checkout summary, FAQ page.

DS-NAV-003
Name: Breadcrumb — shadcn component everywhere (PDP pattern is correct); kill hand-rolled PLP version; add `aria-label="Breadcrumb"` + JSON-LD.

DS-NAV-004
Name: Navbar (rebuild)
Structure: `h-14 lg:h-18` — row: logo (h-8/10) / primary links (5 max: Shop▾, Services▾, Deals, Installation, Support▾) / actions: Search(opens SearchDialog), Account, Cart(badge → opens CartDrawer, NOT /cart).
Mega-menu: activate dormant `sections` machinery — Shop▾ = By Type + By Brand columns.
Mobile: right Sheet drawer (existing dark design).
A11y: `aria-current` on active link; all controls labelled; ≥44px targets.

DS-NAV-005
Name: MegaMenu — columns (heading + links + optional promo tile); Radix NavigationMenu (present).

DS-NAV-006
Name: Footer (global — move to `(shop)/layout.tsx`)
Columns: Brand+contact (real phone/WhatsApp/email) / Shop / Support / Company + newsletter (wired or removed) + payment badges + legal row. **Only link to routes that exist.**

DS-NAV-007
Name: Pagination
Real pagination: prev/next + page numbers, `aria-label="Pagination"`, `aria-current="page"`, URL-synced `?page=`. 40/page. Replace fake buttons.

DS-NAV-008
Name: Stepper (checkout progress — NEW)
Steps: Cart → Details → Payment → Confirm. `aria-current="step"`, completed=success check, current=blue-600, upcoming=gray-400. Optional single-page checkout keeps stepper as section anchors.

DS-NAV-009
Name: SearchDialog (NEW)
cmdk-style: ⌘K/button opens Dialog + input; results grouped Products/Categories/Brands; keyboard nav ↑↓⏎; recent searches (localStorage); "No results for X — try BTU size or brand" empty state.

---

DS-FEEDBACK-001
Name: Skeleton (NEW — critical gap)
Variants: `card` (aspect-square + 3 lines), `line`, `price`, `gallery`, `table-row`.
Usage: PLP grid, PDP, order-confirmed, account lists; `animate-pulse` + `aria-hidden` + parent `aria-busy`.

DS-FEEDBACK-002
Name: Spinner — Lucide `Loader2 animate-spin`; only inside buttons or inline (never full-page — use Skeleton).

DS-FEEDBACK-003
Name: EmptyState (NEW — formalise)
Anatomy: icon (gray-300, 48px) / title (h4) / body (text-small gray-500) / CTA.
Instances: empty cart, no filter results, no orders, no warranties, no search results.

DS-FEEDBACK-004
Name: ErrorState
Anatomy: AlertTriangle (danger) / title / friendly message / [Try again] [Go home] / support link.
Formalise existing `error.tsx`/`not-found.tsx` (already decent — retoken colors).
Add: expired-order-link variant ("This order link has expired — contact us on WhatsApp to retrieve your order.").

DS-FEEDBACK-005
Name: ProgressBar (route transitions)
Top 2px bar, blue-600; covers the "no loading feedback" gap between page loads.

---

DS-COMMERCE-001
Name: PaymentMethodCard
Anatomy: radio (radio-group) + method name + icon/logo + description + expanded detail area when selected (EFT shows banking-summary teaser).
Rule: if `providers.length === 1`, render as static info card, not a radio list.

DS-COMMERCE-002
Name: AddressForm
Field set: street (autocomplete=street-address), city, province (Select), postal code (add — currently missing!), country=ZA fixed.
Validation: zod, postal `\d{4}`.

DS-COMMERCE-003
Name: VariantSelector (extract PDP chip logic)
Anatomy: `fieldset`+`legend` (or role=radiogroup) / Chip per option / unavailable = disabled+strikethrough / selected = solid.
Behavior: state swap + `router.replace` for URL — NOT `router.push` (stops scroll/gallery reset).

DS-COMMERCE-004
Name: CountdownTimer (deals)
`aria-live="off"`, static "Ends 12 Oct" sibling text; reduced-motion = no digit animation.

DS-COMMERCE-005
Name: TrustBar (NEW)
Row: payment logos (real ones from `/public/Payments logo/`), "Secure checkout", returns link, support phone/WhatsApp. Placement: checkout sidebar bottom + footer.

---

## Coverage checklist (all states spec'd)

Every component above declares: variants, sizes, states (default/hover/focus/active/disabled/loading/error/empty where applicable), anatomy, a11y notes. Missing-as-of-today components marked **NEW**: SearchDialog, Stepper, Skeleton, EmptyState, ErrorState, ProgressBar, TrustBar, Pagination (real), PaymentMethodCard, AddressForm, VariantSelector, SegmentedControl, IconButton, OrderSummary, Rating, Price, ProductCard(canonical), CartLineItem.
