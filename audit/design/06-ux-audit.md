# 06 — UX Audit

## Navigation & IA — Critical issues

1. **Dead search.** Icon exists top-right (desktop + mobile), does nothing. For 438 products / 194 families this removes the primary findability path. → **Critical**
2. **Broken chrome links.** Footer + nav point to ~15 routes that 404 (see `04-page-inventory.md`). A user looking for "Shipping & Delivery" — the #1 question for a 30kg appliance — hits a dead end. → **Critical**
3. **No footer below homepage.** Contact, legal, payment trust links vanish on every page where a purchase decision happens. → **Critical**
4. **Flat 11-link nav at 10px.** No grouping (Products/Services/Company mega-menu exists in code but dormant); tiny type; no active-state indication for current page. → High
5. **`/account` index doesn't exist** — nav "Account"/login icon goes to `/login` (ok) but dead Navbar + any `/account` href 404s. Account section has **no sub-navigation** — orders/profile/subscriptions/warranties are orphan pages reachable only from the mobile drawer. → High
6. **Inconsistent breadcrumbs.** PDP uses `Breadcrumb` (DB-driven), PLP hand-rolls `Home > Products`, everywhere else none. → Medium

## Discovery

7. **Filters** work via URL params (shareable ✓) but: FilterSidebar pushes default BTU params on category mount (URL mutates itself); price slider caps at R50k while catalog exceeds it; no applied-filter chips — user can't see/remove individual filters at a glance. → Medium
8. **Fake pagination** (1 2 3 … 10 buttons, no handlers). Either infinite list or real pagination needed; as-is it's a UI lie. → High
9. **Sort** = featured/price/newest — missing "Best selling", "Top rated", "Name". → Low
10. Grid-density toggle (3/4 col) is a nice touch but buttons lack labels. → Low

## PDP — mostly strong

11. Variant/BTU chips, installation No/Yes radiogroup, kit & maintenance modals, warranty selector — rich but long; the buy column grows very tall before "Add to cart" — **CTA may sit below the fold on 13" laptops** once all add-on sections render. → Medium
12. Variant chip click does `router.push` to variant slug — full navigation for an option select; slower than a state swap and resets scroll/gallery. → Medium
13. "From R…" pricing for multi-variant — good. Sold-out chips show line-through + "Out of stock" — good.
14. No delivery ETA, returns snippet, or payment-method info near CTA. → High (CRO overlap)

## Cart & checkout

15. **Dual cart patterns** — drawer (opens post-add) and `/cart` page (nav icon) both fine but cart badge icon doesn't open the drawer users just saw; minor dissonance. → Low
16. Cart page `pt-[220px]` wastes a third of mobile viewport as dead air. → Medium
17. Checkout: single long page, no stepper/progress; province/contact-method are raw `<select>`s; **payment radios render even with one enabled provider**; consent checkbox silently disables submit (no affordance explaining the disabled state); no inline validation — errors only on submit as a banner. → High
18. Enquiry-only products show "Price TBC" through cart/checkout — acceptable, but total still sums priced items without flagging the TBC items in the total row. → Medium
19. **No shipping/delivery cost line anywhere in the funnel.** → Critical (CRO)
20. WhatsApp contact option + `whatsapp_url` on order — strong for SA. ✓

## Post-purchase

21. Order-confirmed page is the most complete surface (status badge, EFT details, print, WhatsApp). It lives *outside* the shop layout → no nav/footer → customer can't continue shopping via chrome (only the "Continue browsing" button). → Medium
22. Order links expire after 48h (except pending EFT) — `notFound()` on expiry shows a generic 404 rather than "this link expired, contact us" — confused-customer risk. → Medium
23. No guest order-lookup (e.g., email+order-number form) — only token link + account. → Medium

## Auth & account

24. Login/signup cards are clean; **dead Google buttons** are trust-negative. → Critical
25. No account landing/dashboard — `/account` 404s; no nav within account pages. → High
26. Password show/hide uses raw inline SVG buttons without aria-label/aria-pressed. → Medium

## Feedback & state

27. **No loading states globally** — route transitions, filter application, PDP variant swaps, data fetches: zero skeletons/spinners/progress. Users on SA mobile connections see frozen pages. → High
28. Sonner mounted, **never invoked** — add-to-cart gives feedback only via drawer auto-open; errors only via inline banners. → Medium
29. Empty states: cart ✓, filtered grid ✓ ("No products found… Clear all"), orders list presumably; **search empty state N/A (no search)**. → Low/Medium
30. Mobile menu (dark drawer, 60px targets) is the best mobile pattern in the app — but it's right-side Sheet while the dead MobileMenu used left; consistent enough. ✓

## Mobile

31. Icon buttons `size-9` = 36px < 44px guidance. → Medium
32. Mobile category Sheet renders from top under 128px header — ok.
33. Checkout on mobile: summary renders *below* the entire form — user scrolls past total before filling details; no sticky total bar. → Medium

## UX scorecard

| Area | Grade |
|---|---|
| Findability | F (no search, dead links) |
| PDP | B+ |
| Cart | B |
| Checkout | C+ |
| Post-purchase | B− |
| Account | D (no IA) |
| Feedback/states | D (no loading, dead toasts) |
| Mobile | C+ |
