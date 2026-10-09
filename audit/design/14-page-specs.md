# 14 — Page-by-Page Design Requirements

Wireframes referenced live in `15-wireframes.md` (WF-xx). "Must" = acceptance gate.

---

## PG-01 Home `/`

- **Goal:** route visitors to category/search/deals; establish trust + brand.
- **User:** all personas, mobile-majority.
- **Layout:** WF-01.
- **Above the fold:** single-slide hero (h1 + subhead + 1 primary CTA + secondary link), autoplay OFF by default or pauseable, ≤100vh minus header.
- **Sections in order:** 1 Hero · 2 Category tiles (Residential/Commercial/Kits/Accessories — linked, not dead) · 3 Service strip (Install/Maintain/Repair/Warranty) · 4 Featured products (ProductCard grid, real data ✓) · 5 Accredited brands · 6 Editorial/value prop · 7 Reviews · 8 Help/CTA · 9 Footer (now global).
- **Components:** HeroCarousel(+pause), CategoryTile, ProductCard, LogoRow, ReviewCard, Footer.
- **Copy:** one headline promise ("Cool in summer. Warm in winter." works — keep), subhead states install included option.
- **States:** default / products-fail → hide section gracefully (already server-fetched) / reduced-motion → static hero.
- **Responsive:** hero full-bleed; category tiles 2×2 mobile; carousels → swipe with visible controls.
- **A11y:** pause control on carousel; one h1; alt on all images.
- **Conversion:** primary CTA to /products; deals banner slot; WhatsApp entry in help section.
- **Analytics:** view_home, hero_cta_click, category_tile_click, featured_product_click.
- **Acceptance:** carousel pausable+reduced-motion-aware; footer renders; no dead links on page; LCP <2.5s.

## PG-02 Category/PLP `/products`, `/categories/[slug]`

- **Goal:** find the right unit → PDP.
- **Layout:** WF-02.
- **Above fold:** compact page header (h1 + count + applied-filter chips) — **remove the 450px hero** (it wastes the most valuable listing real-estate; keep a slim 160px banner max on category pages).
- **Sections:** breadcrumb / filter sidebar (desktop) + filter Sheet (mobile) / toolbar (count, sort, density) — neutral surface, not blue / grid / real pagination.
- **Components:** FilterSidebar (fix auto-inject), AppliedFilterChips, ProductCard, Pagination, SortSelect, Skeleton(grid).
- **Copy:** h1 = actual category name; result count live.
- **States:** default / loading (skeleton grid) / empty (EmptyState + clear-filters) / filter-error.
- **Responsive:** sidebar→Sheet at lg; 2-col grid mobile.
- **A11y:** one h1; labelled controls; slider keyboard-accessible (Radix ✓).
- **Conversion:** stock chips, compare-at prices, "Price on request" for enquiry items, sort by price.
- **Analytics:** filter_apply (per facet), sort_change, pagination_click, product_click(position).
- **Acceptance:** pagination functional or removed; no auto-URL-mutation; toolbar neutral; mobile filter Sheet has focus trap.

## PG-03 Search results `/search` (NEW)

- **Goal:** typed discovery.
- **Layout:** WF-03. SearchDialog (⌘K) quick-results → full page via "See all".
- **Sections:** search field (autofocus) / result count / same filter+grid as PLP / "No results" EmptyState with suggestions + category links.
- **Copy:** `Results for "{q}"`; did-you-mean for zero results [if feasible].
- **A11y:** `role="search"`, live-region result count.
- **Analytics:** search(query, results_count), search_result_click, search_zero_results.
- **Acceptance:** works for name/brand/BTU; debounced; keyboard navigable; zero-result state helpful.

## PG-04 PDP `/products/[slug]`

- **Goal:** configure → add to cart. Highest-value page.
- **Layout:** WF-04.
- **Above fold:** gallery L / buy column R: breadcrumb, brand, h1, rating+stock, price (Price comp), key facts, VariantSelector(s), qty, **Add to cart (angled) above add-ons**, delivery snippet, trust row.
- **Sections:** buy block / add-on accordions (Installation w/ tier auto-select, Kit modal, Maintenance, Warranty) / ProductInfoTabs (desc, specs, delivery, reviews) / related products.
- **Fix required:** move primary CTA above add-on stack (current: bottom of growing column); VariantSelector = state swap not navigation; delete inline `<style>`; single h1 scale.
- **Components:** Gallery (PhotoSwipe ok + reduced-motion), VariantSelector, SegmentedControl, KitModal, MaintenanceModal, WarrantySelector, Price, Rating, TrustRow, StickyMobileCTA.
- **Copy:** "From R X" multi-variant; "Price on request" enquiry; delivery line from `shipping_summary` + link to /shipping (new).
- **States:** default / variant-loading / sold-out (CTA→"Notify me" capture) / enquiry (CTA→"Request quote" → WhatsApp/enquiry) / image-fail placeholder.
- **A11y:** radiogroup pattern on all selectors; gallery keyboard nav; rating aria-label.
- **Conversion:** sticky mobile ATC bar; delivery+returns under CTA; "installation available from R X" line; installment line if partner exists.
- **Analytics:** view_item, variant_select, addon_toggle, add_to_cart, gallery_expand.
- **Acceptance:** ATC reachable without scrolling past all add-ons on 768px-high viewport; variant switch <300ms no full nav; AA contrast on price.

## PG-05 Cart `/cart`

- **Goal:** review + proceed.
- **Layout:** WF-05. Remove `pt-[220px]` → normal header offset.
- **Sections:** h1+count / CartLineItem list / OrderSummary (add Delivery row: "Calculated at checkout") / recommendations strip / TrustRow.
- **States:** empty (EmptyState→/products) / qty-zero = remove confirm (or undo toast) / price-changed notice (server re-resolve — toast "Prices updated").
- **A11y:** remove/qty labelled; line totals `aria-live` summary.
- **Analytics:** view_cart, qty_change, remove_item, begin_checkout.
- **Acceptance:** footer present; remove button labelled; delivery expectation set.

## PG-06 Checkout `/checkout` (single page, stepped sections)

- **Goal:** submit order with minimum friction.
- **Layout:** WF-06.
- **Sections:** Stepper (Cart ✓ → 1 Contact → 2 Delivery & installation → 3 Payment → Review) / FormField grid (add postal code) / PaymentMethodCard(s) + EFT explainer / consent checkbox w/ hint / OrderSummary + TrustRow.
- **Fix required:** inline validation (RHF+zod) + error summary; real Select components; single-provider → info card not radio; consent hint text "Please accept to place your order"; delivery cost row (or explicit "Confirmed after order — R0 shown today" honesty copy); mobile collapsible summary + sticky submit.
- **Copy:** each step's h3 + one-line help; submit = "Place order — R {total}".
- **States:** loading (submit spinner + disabled, `aria-busy`) / field-error / server-error summary / success → /order-confirmed.
- **A11y:** error association, focus-to-first-error, `aria-current="step"`, all inputs 44px+.
- **Conversion:** guest-first (existing ✓), trust row, "No payment taken today" for EFT, WhatsApp contact option kept.
- **Analytics:** begin_checkout, add_shipping_info, add_payment_info, checkout_error(field), purchase (existing).
- **Acceptance:** every field inline-validates; zero dead controls; summary shows delivery expectation; AA contrast on CTA.

## PG-07 Order confirmation `/order-confirmed/[token]`

- **Goal:** confirm + next steps (pay EFT / WhatsApp / print).
- **Layout:** WF-07 — mostly good already.
- **Fix required:** wrap in shop chrome (nav+footer) or intentional clean-page w/ clear return links; expired-link → ErrorState variant w/ recovery, not generic 404; retoken navy.
- **Sections:** status Badge + h1 / status message / EFT banking card (when pending) / order items + totals / customer details / actions (WhatsApp, print, continue, "View in account" when authed).
- **Analytics:** purchase ✓ (LeadTracking exists).
- **Acceptance:** expired/invalid token shows helpful page; print CSS kept; AA badges.

## PG-08 Account dashboard `/account` (NEW)

- **Goal:** account home + section nav.
- **Layout:** WF-08 — sidebar (desktop)/tabs (mobile): Orders, Warranties, Subscriptions, Profile, Sign out.
- **Sections:** greeting / recent-orders card / quick links / account completeness.
- **Fix required:** create `/account/page.tsx` + real nav layout (currently orphan pages + 404 index).
- **Acceptance:** `/account` resolves; every account page reachable from nav.

## PG-09 Order history & detail `/account/orders`, `/account/orders/[id]` (detail NEW)

- **Goal:** find past orders, reorder, track status.
- **Layout:** table (desktop) → cards (mobile); order detail page w/ same OrderSummary comp + status timeline.
- **States:** empty ("No orders yet" → /products), loading skeleton.
- **Acceptance:** reorder action on each row; status Badge tokens.

## PG-10 Auth — `/login`, `/signup`, `/forgot-password`, `/reset-password`

- **Goal:** authenticate or recover.
- **Layout:** centered card ≤440px, brand wordmark (**"Aircons Store"**, navy-800).
- **Fix required:** wire or delete Google buttons; show/hide pw → IconButton w/ aria-label; retoken `#1E3A5F`/`#FAFAF9`; benefits line under signup ("Track orders, manage warranties").
- **States:** pending / field+form errors / success (verify-email notice, reset-sent).
- **A11y:** `role="alert"` ✓ keep; autocomplete attrs (email, current-password, new-password).
- **Acceptance:** zero dead controls; AA contrast; consistent brand.

## PG-11 404 / Error

- **Goal:** recover.
- **Fix required:** retoken to navy-800; keep search suggestions: add links (Products, Categories, Deals, Contact) + maybe SearchDialog trigger; error page adds "WhatsApp us" (already copied — make it a link).
- **Acceptance:** `not-found.tsx` lists 4+ working recovery links; distinct expired-order-link page.

## PG-12 Contact / Support `/contact` (NEW)

- **Goal:** get help fast.
- **Sections:** contact cards (WhatsApp primary, phone, email) / support form (name, contact, order# optional, topic select, message) / FAQ accordion / map/hours block.
- **Also required:** `/faq` (may fold into /contact), `/shipping`, `/returns`, `/cookies` — or remove the links. Minimum viable: one `/support` hub page covering all four, and update footer links to it.
- **Acceptance:** every footer link resolves to a real page.

## PG-13 Legal pages `/privacy`, `/terms`, `/return-policy`, `/warranty`

- **Fix required:** move inside `(shop)` layout so nav/footer render (currently root-level → no chrome); prose styling (text-body, h2 sections, max-w-prose, updated date).
- **Acceptance:** consistent chrome + readable measure ≤75ch.

## PG-14 Admin dashboard `/admin` (MISSING — spec only)

- **Goal:** daily ops at a glance: today's orders, pending payments (EFT), low stock, enquiries.
- **Layout:** WF-09 — sidebar / KPI cards / recent orders table / alerts.
- **Components:** Table, Badge(status), Stat cards, DateRangePicker.
- **Acceptance (phase):** auth-gated; dense tables; one-page scan of "what needs doing today".

## PG-15 Admin products `/admin/products`, `/admin/products/[id]` (MISSING)

- Table: image, name, brand, BTU, price, stock, status, variants count; filters + bulk (publish/unpublish, price adjust); edit = tabbed form (details, pricing, images, variants, stock).
- Variant editor must reflect the parent/variant model (variant_attributes JSONB).

## PG-16 Admin orders `/admin/orders`, `/admin/orders/[id]` (MISSING)

- Table: order#, customer, channel, items, total, payment status, order status, date; status transition UI (pending→paid→fulfilled) matching `payment_status`/`status` vocab on order-confirmed page; detail shows EFT reference + WhatsApp resend + timeline.

---

## Global acceptance gates (all pages)

1. Footer + working nav on every page. 2. Zero dead controls/links. 3. One h1. 4. AA contrast. 5. Loading skeleton or progress on >300ms waits. 6. Reduced-motion respected. 7. Mobile ≥44px targets. 8. formatZAR for all money.
