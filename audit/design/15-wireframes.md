# 15 — Wireframes (ASCII)

Breakpoints shown: desktop (lg+) primary; mobile deltas noted. `▮` = primary CTA.

## WF-01 Home (desktop)

```
┌──────────────────────────────────────────────────────────────────┐
│ LOGO   Shop▾ Services▾ Deals Installation Support▾   🔍 👤 🛒(2)│ h72px
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│   COOL IN SUMMER. WARM IN WINTER.              ┌──────────────┐  │
│   Reverse-cycle aircons for every season.      │ featured     │  │
│   ▮ Shop aircons      Shop installation →      │ product card │  │
│                                                │ R 18 599  ★4.9│
│   ⏸ ◀ ●○○○ ▶                                   └──────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│ [Residential] [Commercial] [Kits] [Accessories]   ← 4 linked tiles│
├──────────────────────────────────────────────────────────────────┤
│ Install ✓   Maintain ✓   Repair ✓   Warranty ✓   (service strip) │
├──────────────────────────────────────────────────────────────────┤
│ Featured products                    [grid 4× ProductCard]       │
├──────────────────────────────────────────────────────────────────┤
│ SAMSUNG LG MIDEA DAIKIN GREE   (accredited brands)               │
├──────────────────────────────────────────────────────────────────┤
│ Editorial │ Reviews carousel │ Help CTA │ ▮                      │
├──────────────────────────────────────────────────────────────────┤
│ FOOTER: contact · shop · support · company · payments · legal   │
└──────────────────────────────────────────────────────────────────┘
Mobile: hero stacked, tiles 2×2, sticky bottom nav optional.
```

## WF-02 PLP (desktop) — replaces 450px hero w/ slim header

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV                                                              │
├──────────────────────────────────────────────────────────────────┤
│ Home › Residential aircons                                       │
│ Residential aircons                    132 products              │
│ [9-12k BTU ×] [Samsung ×] [In stock ×]          Clear all        │
├──────────┬───────────────────────────────────────────────────────┤
│ FILTERS  │ Sort: Featured▾   ▦▦▦ grid                            │
│ ▾Category│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│ ▾BTU     │ │card │ │card │ │card │ │card │                       │
│ ▾Brand   │ │     │ │     │ │     │ │     │                       │
│ Price    │ └─────┘ └─────┘ └─────┘ └─────┘                       │
│ slider   │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐                       │
│ ☑In stock│ └─────┘ └─────┘ └─────┘ └─────┘                       │
│          │                                                       │
│          │            ◀ 1 2 3 … 9 ▶   (real pagination)          │
├──────────┴───────────────────────────────────────────────────────┤
│ FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
Mobile: [Filter] sticky button → Sheet; 2-col grid; chips row scrolls.
```

## WF-03 Search

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV                                    (⌘K opens dialog)         │
├──────────────────────────────────────────────────────────────────┤
│ ┌────────────────────────────────────────────────┐               │
│ │ 🔍 12000 btu samsung                           │  ← autofocus  │
│ └────────────────────────────────────────────────┘               │
│ 24 results for "12000 btu samsung"                               │
│ [same filter sidebar + grid as WF-02]                            │
│                                                                  │
│ Empty: "No results for 'x'. Try a BTU size or brand."           │
│        [Residential] [Commercial] [All products]                 │
├──────────────────────────────────────────────────────────────────┤
│ FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
```

## WF-04 PDP (desktop) — CTA moved above add-ons

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV                                                              │
├───────────────────────────────┬──────────────────────────────────┤
│ Home › Residential › Samsung  │                                  │
│ ┌───────────────────────────┐ │ SAMSUNG                          │
│ │                           │ │ WindFree 12000 BTU Inverter      │
│ │       GALLERY 4:3         │ │ ● In stock  ★4.9 (5.8k)          │
│ │                           │ │ R 18 599  <s>R 21 999</s> -15%   │
│ └───────────────────────────┘ │ Covers up to 30 m² · WiFi · A++  │
│  [thumb][thumb][thumb][thumb] │                                  │
│                               │ Size: [9k][12k✓][18k][24k]       │
│                               │ Qty [- 1 +]                      │
│                               │ ▮▮ ADD TO CART — R 18 599 ▮▮     │
│                               │ 🚚 Delivery & install: details → │
│                               │ ↩ Returns · 🔒 Secure checkout   │
│                               │                                  │
│                               │ ▾ Installation  from R 1 950     │
│                               │ ▸ Installation kit               │
│                               │ ▸ Maintenance plan               │
│                               │ ▸ Extended warranty              │
├───────────────────────────────┴──────────────────────────────────┤
│ [Description] [Specs] [Delivery] [Reviews]  (tabs)               │
│ You may also like: [4× ProductCard]                              │
│ FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
Mobile: gallery → buy stack; STICKY BOTTOM BAR: [R 18 599 | ▮ Add to cart]
```

## WF-05 Cart

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV                                  Cart (2 items)              │
├───────────────────────────────────────┬──────────────────────────┤
│ [img] Samsung 12000 BTU Inverter      │ ORDER SUMMARY            │
│       12 000 BTU · Installation       │ Subtotal      R 36 198   │
│       [- 1 +]              R 18 599   │ Installation    R 1 950  │
│       🗑 Remove                      │ Delivery    at checkout  │
│ ─────────────────────────────────     │ ───────────────────────  │
│ [img] Installation kit                │ Total         R 38 148   │
│                            R 1 450    │ ▮ Checkout — R 38 148    │
│                                       │ Continue shopping        │
│ You may also like [3 compact cards]   │ 🔒 Secure · ↩ Returns    │
├───────────────────────────────────────┴──────────────────────────┤
│ FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
```

## WF-06 Checkout (stepped single page)

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV                        ●Cart ✓━●1 Details━○2 Payment━○Review │
├───────────────────────────────────────┬──────────────────────────┤
│ 1 CONTACT                             │ ▾ ORDER SUMMARY (mobile) │
│  [First name*] [Last name]            │ items…                   │
│  [Email*]      [Phone*]               │ Delivery  at checkout    │
│ 2 DELIVERY & INSTALLATION             │ Total         R 38 148   │
│  [Address*]                           │                          │
│  [City*] [Province▾*] [Postal*]       │ ┌──────────────────────┐ │
│  [Installation notes        ]         │ │🔒 Secure · Payfast   │ │
│ 3 PAYMENT                             │ │  EFT · ↩ Returns     │ │
│  ┌────────────────────────────────┐   │ │  ☎ 0xx xxx xxxx      │ │
│  │● Manual EFT — pay via bank     │   │ └──────────────────────┘ │
│  │  transfer. Details on confirm. │   │                          │
│  └────────────────────────────────┘   │                          │
│ 4 REVIEW                              │                          │
│  Preferred contact: [WhatsApp+email▾] │                          │
│  ☑ I consent to processing my details │                          │
│    to fulfil this order. Privacy →    │                          │
│  ▮▮ PLACE ORDER — R 38 148 ▮▮        │                          │
│  We'll confirm delivery costs before  │                          │
│  payment is due.                      │                          │
├───────────────────────────────────────┴──────────────────────────┤
│ FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
Error: summary banner top + inline field errors; focus→first error.
```

## WF-07 Order confirmed

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV                                                              │
│            ┌──────────────────────────────────────┐              │
│            │ [Payment Pending]                    │              │
│            │ Order received                       │              │
│            │ Order #ACS-20261009-0042             │              │
│            │ ┌──────────────────────────────────┐ │              │
│            │ │ Pay via EFT to confirm:          │ │              │
│            │ │ Bank … Account … Ref #…          │ │              │
│            │ │ Amount due            R 38 148   │ │              │
│            │ └──────────────────────────────────┘ │              │
│            │ Items … Totals … Details …           │              │
│            │ [▮ WhatsApp us] [Print] [Continue]   │              │
│            └──────────────────────────────────────┘              │
│ FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
Expired token → "This order link has expired" + WhatsApp recovery CTA.
```

## WF-08 Account

```
┌──────────────────────────────────────────────────────────────────┐
│ NAV                                                              │
├────────────┬─────────────────────────────────────────────────────┤
│ Hi, Hannes │ Recent orders                                       │
│ Orders     │ ┌──────────────────────────────────────────────┐    │
│ Warranties │ │#ACS-0042  Pending   R 38 148   [View][Reorder]│   │
│ Subs       │ │#ACS-0031  Paid      R 18 599   [View][Reorder]│   │
│ Profile    │ └──────────────────────────────────────────────┘    │
│ ──────     │ Active warranties: 2 · Maintenance plan: due Nov    │
│ Sign out   │                                                     │
├────────────┴─────────────────────────────────────────────────────┤
│ FOOTER                                                           │
└──────────────────────────────────────────────────────────────────┘
Mobile: sections become cards; sidebar → horizontal scroll tabs.
```

## WF-09 Admin (MISSING — to-be)

```
┌──────────────────────────────────────────────────────────────────┐
│ ☰ Aircons Admin                         search ⌘K    avatar      │
├──────────┬───────────────────────────────────────────────────────┤
│ Dashboard│ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐            │
│ Orders   │ │Today   │ │Pending │ │Low     │ │Enquiry │            │
│ Products │ │orders  │ │EFT     │ │stock   │ │items   │            │
│ Customers│ │  7     │ │  4     │ │  3     │ │  2     │            │
│ Deals    │ └────────┘ └────────┘ └────────┘ └────────┘            │
│ Settings │ Recent orders                                        │
│          │ ┌──────────────────────────────────────────────────┐ │
│          │ │#0042 Hannes  R38148  [Pending]  WhatsApp  09:41  │ │
│          │ │#0041 Lindiwe R18599  [Paid]     Email     08:12  │ │
│          │ └──────────────────────────────────────────────────┘ │
└──────────┴───────────────────────────────────────────────────────┘
```
