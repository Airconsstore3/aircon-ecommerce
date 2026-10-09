# 17 — Open Questions

Answers needed to finalize the Design Brief and Phase 0 scope.

## Brand & business

1. **Official brand name:** "Aircons Store" or "AirconsStore"? (metadata uses former, login uses latter — pick one).
2. **Canonical logo:** `/Logo.svg`, `/aircon store logo.svg`, `/Aircons Store.svg`, `src/Aircons logo 2.svg` — which file is final? Is there a brand guide for clear-space/min-size?
3. **Brand personality confirmation:** audit assumes "pragmatic expert / trustworthy SA service brand". Correct? Any words the brand must/never use?
4. **Target regions:** all of SA or metro focus? (affects delivery messaging + imagery).
5. **Competitors to benchmark:** e.g. Takealot appliances, Aircon Hyper, Fourways Aircon, Builders Warehouse — which are the bar?

## Commerce model

6. **Delivery pricing:** flat rate, free over threshold, region-based, or quoted post-order? (Blocks the checkout delivery line + `/shipping` page.)
7. **Payment:** will Payfast be re-enabled? Any financing partners (Payflex, Mobicred, PayJustNow, Float)? (Drives PaymentMethodCard + installment messaging.)
8. **Manual EFT flow:** is the banking-details-first order model permanent, or a bridge to gateway payments?
9. **Enquiry-only products:** should "Price TBC" items route to a structured quote form or WhatsApp? (PDP CTA depends.)
10. **Wishlist/save-for-later:** wanted? (links exist in dead nav; backend not implemented.)

## Product & content

11. **Reviews:** is there real review data in Supabase (`product.rating`/`review_count` exists in the type), or should PDP reviews come from Trustpilot (assets exist in `/public/trustpilot/`)?
12. **Real contact details:** phone number, WhatsApp business number, support email, physical address/hours. Current: `+27 21 000 0000` placeholder.
13. **Newsletter:** which ESP/Supabase table should subscribe post to — or remove it?
14. **Which dead routes are real roadmap?** (`/faq`, `/blog`, `/brands`, `/categories/kits`, `/categories/heat-pumps`, `/categories/portable`, `/book-installation`) — build or delete links?

## Technical & team

15. **Admin:** confirmed no admin UI exists — who manages orders today (Supabase dashboard? ops person?) and is a web admin in scope for design now or later?
16. **Analytics:** beyond `LeadTracking` purchase event — is there a dataLayer/GA4/Pixel plan? Cookie banner already initializes `gtag` — what IDs are configured?
17. **Email:** are transactional emails sent (order confirmation via `channel=email`)? Where do templates live — out of repo?
18. **Dark mode:** confirmed no requirement? (Recommend defer.)
19. **Design owner:** who approves design decisions — solo founder, agency, dev team?
20. **Release constraints:** can Phase 0 ship incrementally behind no flag, or does the live store need staged rollouts?
