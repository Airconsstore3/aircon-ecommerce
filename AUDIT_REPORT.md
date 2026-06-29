# AUDIT REPORT

Generated: 2026-06-29 12:22 UTC+02
Project: aircon-ecommerce
Scope: inspection-only pre-development snapshot

## 1. EXECUTIVE SUMMARY

- **Current build status**: Passing. `pnpm build` completed successfully with Next.js 16.2.6 / Turbopack.
- **TypeScript status**: Passing. `pnpm exec tsc --noEmit` exited with code 0 and no output.
- **Lint status**: Passing. `pnpm lint` exited with code 0 and no output.
- **Critical blockers**: None from local build/typecheck/lint.
- **High-risk issues**:
  - Working tree has existing uncommitted modifications across product/category/deal/shop components.
  - `.env.local` contains a live-looking `SHADCNBLOCKS_API_KEY`; it should be treated as sensitive.
  - Vercel dashboard, analytics, and build logs were not accessible from local files/tools; only the public URL was checked.
  - Deal cards include an absolute overlay link to `/deals/[slug]`, but no `/deals/[slug]` route exists locally.
- **Codebase health score**: 7/10. The app builds and typechecks, uses modern Next.js/Tailwind/shadcn patterns, but has mock-only data, limited deployment observability, no tests, and several hardcoded/placeholder integrations.

## 2. REPO & BUILD HEALTH

### Git status

- **Branch**: `main`
- **Tracking**: `main...origin/main`
- **Uncommitted changes**:
  - `src/app/(shop)/categories/[slug]/page.tsx`
  - `src/app/(shop)/deals/page.tsx`
  - `src/app/(shop)/products/[slug]/ProductDetailClient.tsx`
  - `src/app/(shop)/products/[slug]/page.tsx`
  - `src/app/(shop)/products/page.tsx`
  - `src/components/help2.tsx`
  - `src/components/shop/FilterSidebar.tsx`
  - `src/components/shop/ProductCard.tsx`

### Recent commits

- `dc2a62a` Fix cart feedback and featured units behavior
- `4a88cb1` Update pagination to Apple-style design across all pages
- `206628d` Add pagination to categories and deals pages, remove old hero
- `5eb0e83` Apply consistent hero design across all pages
- `e6dc59e` Add breadcrumb arrow icon, pagination, and adjust spacing
- `397e2a0` Remove hero margin-top to eliminate gap between navbar and hero
- `2d19d40` Fix dead buttons and broken links in home page components
- `7524179` Add full-width background image to hero section on products sale page
- `4bdd6f6` Fix hero height to 400px and add margin-top to h1
- `e0bdd7c` Add hero section to products sale page with left alignment and matching homepage font

### Dependencies

From `package.json` and `pnpm-lock.yaml`:

- **Next.js**: `16.2.6`
- **React**: `19.2.4`
- **React DOM**: `19.2.4`
- **TypeScript**: `^5` locked to `5.9.3`
- **ESLint**: `^9` locked to `9.39.4`
- **eslint-config-next**: `16.2.6`
- **Tailwind CSS**: `^4` locked to `4.3.0`
- **@tailwindcss/postcss**: `^4` locked to `4.3.0`
- **shadcn CLI/package**: `^4.9.0` locked to `4.9.0`
- **radix-ui aggregate package**: `^1.4.3` locked to `1.4.3`
- **lucide-react**: `^1.17.0` locked to `1.17.0`
- **framer-motion**: `^12.40.0` locked to `12.40.0`
- **react-hook-form**: `^7.77.0` locked to `7.77.0`
- **@hookform/resolvers**: `^5.4.0` locked to `5.4.0`
- **zod**: `^4.4.3` locked to `4.4.3`
- **sonner**: `^2.0.7` locked to `2.0.7`
- **class-variance-authority**: `^0.7.1` locked to `0.7.1`
- **clsx**: `^2.1.1` locked to `2.1.1`
- **tailwind-merge**: `^3.6.0` locked to `3.6.0`
- **tw-animate-css**: `^1.4.0` locked to `1.4.0`
- **embla-carousel-react**: `^8.6.0` locked to `8.6.0`
- **embla-carousel-autoplay**: `^8.6.0` locked to `8.6.0`
- **photoswipe**: `^5.4.4` locked to `5.4.4`

### Dependency warnings / mismatches

- **No package/lock mismatch observed**: `package.json` specs are represented in `pnpm-lock.yaml` importer entries.
- **Tailwind config**: No `tailwind.config.ts/js` exists. This appears intentional for Tailwind v4 CSS-first setup via `@import "tailwindcss"` and `@theme inline` in `src/app/globals.css`.
- **shadcn config**: `components.json` has `tailwind.config` set to an empty string and `tailwind.css` set to `src/app/globals.css`, consistent with Tailwind v4 style.

### Build / typecheck / lint results

- **`pnpm build`**: Passed.
  - Output included: `Next.js 16.2.6 (Turbopack)`, `.env.local`, `Compiled successfully`.
  - No captured build warnings or failures.
- **`pnpm exec tsc --noEmit`**: Passed with no output.
- **`pnpm lint`**: Passed with no output.
- **`pnpm install`**: Not run because `node_modules/` and `pnpm-lock.yaml` were present and build/typecheck/lint executed successfully.

### `next.config.ts` issues

- **Config keys present**: None. `nextConfig` is an empty object.
- **`ignoreBuildErrors`**: Not present.
- **`ignoreDuringBuilds`**: Not present.
- **Unrecognized `eslint` key**: Not present.
- **Observation**: Comments state TypeScript/ESLint errors are no longer ignored, matching the empty config.

## 3. PROJECT STRUCTURE

### Root-level files/directories

- `.env.local`
- `.gitignore`
- `.next/`
- `Google_Sans_Flex/`
- `README.md`
- `components.json`
- `eslint.config.mjs`
- `globals (1).css`
- `next-env.d.ts`
- `next.config.ts`
- `node_modules/`
- `package.json`
- `pnpm-lock.yaml`
- `pnpm-workspace.yaml`
- `postcss.config.mjs`
- `public/`
- `src/`
- `tsconfig.json`

### `src/` abbreviated tree

- `src/app/`
  - `layout.tsx`, `globals.css`, `error.tsx`, `not-found.tsx`, `favicon.ico`
  - `(auth)/layout.tsx`
  - `(auth)/forgot-password/page.tsx`
  - `(auth)/login/page.tsx`
  - `(auth)/signup/page.tsx`
  - `(shop)/page.tsx`
  - `(shop)/about/page.tsx`
  - `(shop)/cart/page.tsx`
  - `(shop)/categories/[slug]/page.tsx`
  - `(shop)/deals/layout.tsx`
  - `(shop)/deals/page.tsx`
  - `(shop)/enquire/page.tsx`
  - `(shop)/installation/page.tsx`
  - `(shop)/maintenance/page.tsx`
  - `(shop)/products/page.tsx`
  - `(shop)/products/[slug]/page.tsx`
  - `(shop)/products/[slug]/ProductDetailClient.tsx`
  - `(shop)/repairs/page.tsx`
  - `(shop)/track/[ref]/page.tsx`
  - `account/layout.tsx`
  - `account/orders/page.tsx`
  - `account/profile/page.tsx`
  - `account/subscriptions/page.tsx`
  - `account/warranties/page.tsx`
  - `api/enquire/route.ts`
  - `privacy/page.tsx`
  - `terms/page.tsx`
- `src/components/`
  - Marketing/page sections: `delivery-installation-section.tsx`, `ecommerce-footer20.tsx`, `ecommerce-hero3.tsx`, `help2.tsx`, `hero-section.tsx`, `incentives1.tsx`, `logo-carousel.tsx`, `order-history4.tsx`, `price.tsx`, `product-categories*.tsx`, `product-list*.tsx`, `rating.tsx`, `trust-strip1.tsx`
  - `account/OrderHistory.tsx`
  - `shadcnblocks/logo.tsx`, `shadcnblocks/navbar.tsx`
  - `shop/CartDrawer.tsx`, `CartProvider.tsx`, `FilterSidebar.tsx`, `Navbar.tsx`, `NavbarWrapper.tsx`, `ProductCard.tsx`
  - `ui/` shadcn/Radix primitives: accordion, aspect-ratio, badge, breadcrumb, button, card, carousel, checkbox, context-menu, dropdown-menu, field, input, input-group, label, navigation-menu, radio-group, select, separator, sheet, slider, tabs, textarea, tooltip
- `src/hooks/`
  - `use-mobile.ts`
  - `useMediaQuery.ts`
- `src/lib/`
  - `filterProducts.ts`
  - `mock-data.ts`
  - `utils.ts`

### Public assets

- Root SVGs: `aircon store logo.svg`, `Aircons Store.svg`, `Logo.svg`, `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg`
- Hero images: multiple `.png` / `.webp` files under `public/Hero Images/`
- Brand logos under `public/Hero Images/aircon coursel logo/`
- Product/featured/category images under `public/Hero Images/Featured In section/` and `public/Hero Images/Product category pictures/`

### Design system values

- **CSS source**: `src/app/globals.css`
- **Tailwind**: v4 CSS-first; no root `tailwind.config.ts` found.
- **CSS variables**:
  - `--background`: `#F0F9FF`
  - `--foreground`: `#0A2540`
  - `--primary`: `#1C99D6`
  - `--primary-foreground`: `#ffffff`
  - `--secondary`: `#D7F0FC`
  - `--secondary-foreground`: `#0A2540`
  - `--muted`: `#E6F5FD`
  - `--muted-foreground`: `#335B74`
  - `--accent`: `#F0F9FF`
  - `--accent-foreground`: `#0A2540`
  - `--destructive`: `#ef4444`
  - `--border`: `#B8E3F7`
  - `--ring`: `#1C99D6`
  - `--radius`: `0.5rem`
- **Fonts**:
  - `Inter` via `next/font/google`, applied to body class.
  - `Poppins` via `next/font/google`, CSS variable `--font-poppins`.
  - `Google Sans Flex` local font from `Google_Sans_Flex/...ttf`, CSS variable `--font-google-sans-flex`.
  - Headings use `var(--font-google-sans-flex), Inter, system-ui, sans-serif`.
- **Notable hardcoded colors**: `#1E3A5F`, `#1C99D6`, `#0A2540`, `#2599d4`, `#FAFAF9` appear repeatedly in components.

### Environment variables

From `.env.local`:

- **`SHADCNBLOCKS_API_KEY`**: Present. Value masked as `sk_live_...IMIosG`. Controls authenticated shadcnblocks registry access via `components.json`.

Referenced but not defined in `.env.local`:

- **`CALLMEBOT_PHONE`**: Required by `/api/enquire` to send WhatsApp messages.
- **`CALLMEBOT_API_KEY`**: Required by `/api/enquire` to send WhatsApp messages.
- **`RESEND_API_KEY`**: Required by `/api/enquire` to send confirmation emails.

## 4. ROUTING & FLOWS

### Route map

- `/`: Shop homepage.
- `/about`: About/company information.
- `/cart`: Quote cart page.
- `/categories/[slug]`: Category listing page driven by category slug.
- `/deals`: Deal listing page.
- `/enquire`: Quote/enquiry form page.
- `/installation`: Installation services page.
- `/maintenance`: Maintenance services page.
- `/products`: Product listing/filtering page.
- `/products/[slug]`: Product detail page backed by `mockProducts` slug lookup.
- `/repairs`: Repairs/callouts page.
- `/track/[ref]`: Order tracking page.
- `/login`: Auth login route group page.
- `/signup`: Auth signup route group page.
- `/forgot-password`: Auth recovery route group page.
- `/account/orders`: Account orders page.
- `/account/profile`: Account profile page.
- `/account/subscriptions`: Account subscriptions page.
- `/account/warranties`: Account warranties page.
- `/privacy`: Privacy policy.
- `/terms`: Terms and conditions.
- `/api/enquire`: POST API route for enquiry submission.

### Product browsing flow

- **Entry points**:
  - Homepage featured product links.
  - Navbar product/category links.
  - Footer product/service links.
  - `/products` page and `/categories/[slug]` page.
- **Product list**:
  - `/products` imports `mockProducts` and filters through `filterProducts`.
  - Products are converted into `AirconProduct` with mocked stock values.
  - `AirconProductList` renders `AirconProductCard`.
- **Product detail**:
  - `AirconProductCard` links to `/products/${product.slug}`.
  - `/products/[slug]/page.tsx` finds the product by `mockProducts.find((p) => p.slug === slug)`.
  - `ProductDetailClient` renders detail UI and cart actions.
- **Cart interaction**:
  - Product detail `handleAddToCart` calls `addItem` from `CartProvider`.
  - Deal cards also call `addItem`, using deal IDs/slugs rather than product IDs/slugs.

### Checkout / enquiry flows

No payment checkout route exists. Current flow is quote/enquiry-oriented.

- **Flow A: Cart-based enquiry**
  - User adds product/deal to cart.
  - `/cart` shows cart contents from `useCart`.
  - Request Quote button links to `/enquire`.
  - `/enquire` maps cart items to form `products` payload and POSTs to `/api/enquire`.
- **Flow B: Single product quote**
  - Product detail can route or submit with product context.
  - `/enquire` reads `product` query param as `productSlug` if present.
- **Flow C: Service/commercial enquiry**
  - `/enquire` supports `propertyType` residential/commercial.
  - Residential and commercial sections have different schema fields.
  - Submission sends data to `/api/enquire`, which generates `ENQ-YYYY-####`.

### Admin flow

- **Admin routes**: None found under `src/app`.
- **Authentication**: Login/signup/forgot-password UI routes exist, but no Supabase auth or server auth middleware was found.
- **Product CRUD**: None found.
- **Promo CRUD**: None found.

## 5. STATE MANAGEMENT

### Context providers

- **`CartProvider`**: Global provider mounted in root layout around `NavbarWrapper` and page content. Stores cart items, exposes `addItem`, `removeItem`, `updateQty`, `clearCart`, `itemCount`, and `total`.
- **`PriceContext`**: Small context in `src/components/price.tsx` to share price sale state.
- **UI contexts**: shadcn carousel has internal `CarouselContext`.

### `localStorage` usage

- **Key**: `cart`
- **Read**: `CartProvider` reads `localStorage.getItem('cart')` on mount.
- **Write**: `CartProvider` writes `localStorage.setItem('cart', JSON.stringify(items))` after hydration and whenever items change.
- **Hydration guard**: `hydrated` state prevents overwriting localStorage before initial read.

### Custom hooks

- **`useCart`**: Accesses cart context and enforces provider usage.
- **`useCountdown`**: Local helper in `ProductCard.tsx` for deal countdown timers.
- **`useMediaQuery`**: Tracks `window.matchMedia(query)` and updates on media query changes.
- **`useIsMobile`**: Tracks viewport below `1024px`.
- **`useCarousel`**: Internal shadcn carousel hook.
- **`usePriceContext`**: Reads `PriceContext`.

## 6. DATA ARCHITECTURE

### Mock data entities

All main mock entities are in `src/lib/mock-data.ts`.

- **`Product`**:
  - Fields: `id`, `name`, `slug`, `description`, `category_id`, `type`, `brand`, `btu_range`, `images`, `price_zar`, `sale_price_zar`, `is_published`, `is_enquiry_only`, `is_featured`, `is_sale`, `is_deal`, `sort_order`, `specs`, `documents`, timestamps.
  - Count: 8 products.
  - Hardcoded IDs: `prod-1` through `prod-8`.
- **`Category`**:
  - Fields: `id`, `name`, `slug`, `description`, `image_url`, `parent_id`, `sort_order`, `is_published`, SEO metadata, timestamps.
  - Count: 4 categories.
  - IDs/slugs: `cat-1/residential`, `cat-2/commercial`, `cat-3/installation`, `cat-4/maintenance`.
- **`Promotion`**:
  - Fields: `id`, `name`, `code`, `type`, `value`, `applies_to`, category/product targeting, dates, active/max/current usage, timestamps.
  - Count: 2 promotions.
  - Codes: `SUMMER15`, `SAVE500`.
- **`Order`**:
  - Single `mockOrder` with `order_ref` `ORD-2025-0042`.
- **`OrderTracking`**:
  - 4 tracking records, with PayFast-related status notes.
- **`Deal`**:
  - Fields: `id`, `name`, `slug`, `description`, `original_price_zar`, `sale_price_zar`, `ends_at`, `deal_type`, `stock_remaining`, `is_hero`, optional `product_id`, `images`, optional `includes`, timestamps.
  - Count visible from inspected data: 6 deals.

### Mock product slugs

- `samsung-9000btu-inverter-split-wall`
- `lg-12000btu-inverter-split-wall`
- `daikin-24000btu-commercial-ducted`
- `standard-residential-installation`
- `annual-maintenance-plan`
- `copper-pipe-kit-3m`
- `1-year-extended-warranty`
- `samsung-9000btu-complete-package`

### Slug mismatches / route risks

- **Deal overlay route mismatch**: `DealCard` has an absolute overlay link to `/deals/${deal.slug}`, but no `src/app/(shop)/deals/[slug]/page.tsx` exists. Clicking the card background can lead to a not-found page.
- **Deal View product mitigation**: The visible `View product` button computes `productHref` from `deal.product_id` via `mockProducts`; if found, it routes to an actual product slug.
- **Footer category mismatches**:
  - Footer links include `/categories/kits`, `/categories/accessories`, `/categories/warranty`.
  - `mockCategories` has only `residential`, `commercial`, `installation`, `maintenance`.
  - `filterProducts` maps `kits` to `cat-3`, but does not map `accessories` or `warranty`.
- **Navbar label mismatch**: Navbar displays `Kits` but links to `/categories/installation`.

### Hardcoded values duplicating mock data

- **Stock values**: Product list/detail conversion hardcodes stock count `10`, not from `mockProducts`.
- **Category mapping**: `filterProducts` has hardcoded `categoryMap` duplicating category IDs/slugs.
- **Promo code**: Cart page uses hardcoded `WINTER25`, while mock promotions define `SUMMER15` and `SAVE500`.
- **Contact phone**: `/enquire` header hardcodes `082 123 4567`.
- **Order/payment terms**: PayFast/Supabase/Yoco references appear in policy/terms text without implementation code.

### API routes

- **`POST /api/enquire`**:
  - Validates contact fields.
  - Generates enquiry reference.
  - Formats WhatsApp message.
  - Attempts asynchronous CallMeBot WhatsApp send if env vars exist.
  - Attempts asynchronous Resend confirmation email if env var exists.
  - Logs enquiry to server console.
  - Returns JSON `{ success, referenceNumber, message }`.

### Third-party integrations

- **Supabase**: Only mentioned in privacy copy. No Supabase client/auth/database implementation found.
- **PayFast**: Mentioned in mock order tracking and terms/about copy. No PayFast API/payment route found.
- **Resend**: Implemented as raw `fetch('https://api.resend.com/emails')` in `/api/enquire`, gated by `RESEND_API_KEY`, which is not present in `.env.local`.
- **CallMeBot**: Implemented as raw WhatsApp API fetch in `/api/enquire`, gated by `CALLMEBOT_PHONE` and `CALLMEBOT_API_KEY`, neither present in `.env.local`.
- **shadcnblocks**: Configured in `components.json` with `SHADCNBLOCKS_API_KEY` from `.env.local`.

## 7. KNOWN ISSUES

### Nav cart badge not updating

- **Observed code path**: `Navbar` reads `itemCount` from `useCart`; `CartProvider.addItem` updates React state with `setItems`.
- **Local audit result**: No code-level root cause confirms a stale badge in the current tree. The current provider pattern should re-render consumers when `items` changes.
- **Likely historical/root causes to verify in browser**:
  - Add-to-cart buttons on product listing are actually links to detail pages; product listing does not add to cart.
  - Deal card has an absolute overlay link (`z-50`) over the card and the button wrapper uses `z-[60]`; if stacking/event behavior fails, clicks may route instead of calling `handleAddToCart`.
  - Badge updates only for components under the single root `CartProvider`; this is true in `layout.tsx`.
- **Console noise**: `CartProvider.addItem` logs `Adding item to cart`, `Item already exists...`, and `Adding new item` in production client code.

### Product not found errors

- **Confirmed actual product route lookup**: `/products/[slug]` only matches `mockProducts.slug`.
- **Potential confirmed mismatch**: Deal cards link the card overlay to `/deals/[slug]`, not `/products/[slug]`, and no deal detail route exists.
- **Product slug links from `AirconProductCard`**: These use real `product.slug` values and should match `mockProducts`.
- **Live public homepage links**: Public URL includes links to product slugs that match local `mockProducts` for featured units.

### TypeScript errors

- **`pnpm exec tsc --noEmit`**: No errors.

### Lint errors

- **`pnpm lint`**: No errors.

### Console errors

- **Dev server browser console**: Not fully inspected in an interactive browser session during this audit.
- **Server/client logs visible in code**:
  - Cart logs normal add/update events.
  - `/api/enquire` warns if CallMeBot/Resend env vars are missing.
  - `/api/enquire` logs enquiry submissions.

## 8. DEPLOYMENT STATUS

### Live URL

- **URL checked**: `https://aircon-ecommerce.vercel.app`
- **Reachable**: Yes.
- **Functional from HTTP content fetch**: Yes. The homepage title and navigable content were returned.

### Vercel config files

- **`vercel.json`**: Not found.
- **`.vercelignore`**: Not found.

### Vercel deploy status / dashboard / analytics / logs

- **Project dashboard**: Not accessible from local workspace/tools.
- **Vercel Analytics**: Could not be verified from local files/tools.
- **Last deploy timestamp**: Not available from local files/tools.
- **Last deploy warnings**: Not available from local files/tools.

## 9. CODEBASE METRICS

- **Total page files**: 21 `page.tsx` files under `src/app`.
- **Total component files**: 51 `.tsx` files under `src/components`.
- **Approximate TypeScript/TSX LOC**: 14,667 lines under `src`.
- **Tests**: No test files or test framework configuration found during structure inspection.
- **API route files**: 1 route file: `src/app/api/enquire/route.ts`.
- **Mock products**: 8.
- **Mock categories**: 4.
- **Mock promotions**: 2.
- **Mock order records**: 1 order, 4 tracking entries.
