# 17 — Open Questions for the Founder

## Business

1. What is the **registered legal entity** (name, registration number, VAT number, registered address) trading as "Aircons Store"?
2. Is the business a sole proprietorship, (Pty) Ltd, or trading-as? Who is the owner of record?
3. Is the business a **registered VAT vendor**? Are listed prices VAT-inclusive?
4. What does "nationwide delivery" mean operationally — which provinces/areas do you actually deliver and install in?
5. What are the real business hours, phone number, and physical/postal address for legal pages?
6. What is the business's actual revenue split: product sales vs installation vs maintenance?

## Product

7. Where do products come from — which distributors/suppliers? Any authorized-dealer agreements with the 8 brands?
8. Is inventory physically stocked, ordered-on-demand, or dropshipped?
9. Are product images licensed from distributors/OEMs, or scraped/AI-generated?
10. Should deal prices be honoured at checkout (currently they are not)?
11. Are subscriptions/warranties real products customers can buy today, or aspirational?

## Legal

12. Who is the designated **POPIA Information Officer**? Is there a PAIA manual?
13. Were the T&Cs (dated Jan 2025, predating the build) drafted for this business or copied? Do the 50%-deposit terms reflect real policy?
14. Does the ECTA s44 **7-day cooling-off right** apply and is it honoured?
15. Are installers **SAQCC-gas / refrigerant-handling registered**? Is the "accredited installation" claim supportable?
16. Is there public liability insurance covering installations?
17. Should fake ratings/testimonials be removed, or will a real reviews program replace them?

## Operations

18. Who actually processes each order today — walk me through one real order end-to-end.
19. Who installs — employees, subcontractors, referred installers? Who schedules them?
20. How is delivery handled — own vehicle, courier (which?), customer-arranged?
21. What is the refund/return SOP in practice?
22. Which email inboxes exist and who monitors them (info@/support@/privacy@)?
23. Why was the admin panel deleted — intentional or accident? Should it be rebuilt?
24. Does the 90-day PII purge job actually run in production?

## Technical

25. Has `20260925_audit_hardening.sql` been applied in the Supabase dashboard?
26. Has `ORDER_WEBHOOK_SECRET` been rotated since it entered git history?
27. Is the GitHub PAT in the local remote still active? (rotate regardless)
28. Which domain is owned — `airconsstore.co.za`, `aircons-store.co.za`, both?
29. Who holds the shadcnblocks license, Vercel account, Supabase org, Payfast merchant account, Resend account — all under one owner?
30. Is there any backup/DR arrangement for the Supabase database?

## Financial

31. Which bank account receives EFTs (the `settings.bank_*` values) — business or personal account?
32. Is there a Payfast merchant account in good standing (KYC complete)? Timeline to enable?
33. Who pays for what: domain, Vercel, Supabase, Resend, Upstash — consolidated under one billing owner?
34. What margin exists on each product line after delivery+install costs? (Needed before shipping fees/VAT are modelled.)

## Market

35. Who is the ideal customer — residential vs commercial split you're targeting?
36. How do customers currently find you — Google Ads running? SEO only? Word of mouth?
37. Is there a real Trustpilot/Google Business profile to link?
38. What brands/prices do you compete on — cheapest, service-led, or speed?

## Team

39. Is "Sim" the sole owner? Full name for stakeholder records?
40. Anyone else with access: admins table members, Vercel/Supabase collaborators, accountants?
41. Who maintains the site if the AI tooling is unavailable — is there a developer on call?
42. Budget/time appetite for the highest-leverage fix (minimal admin order panel)?
