# Flow Diagrams (as-implemented)

All diagrams are evidence-based on the Oct-9 code trace. Dashed lines mark
missing/broken paths.

## 1. High-level user journey map

```mermaid
flowchart TD
    A[Visitor] --> B["/ Home"]
    B --> C{Navigate}
    C -->|navbar links| D["/products · /deals · /categories/x"]
    C -->|dead links| X["/contact /faq /shipping /blog<br/>→ 404"]
    C -->|search icon| S["DEAD — no handler"]
    D --> E["/products/[slug] PDP"]
    E --> F{Configure}
    F -->|variant + install + kit<br/>+ maintenance + warranty| G[Add to cart]
    G --> H["localStorage cart<br/>+ CartDrawer"]
    H --> I["/cart → /checkout"]
    I --> J["submitCheckout<br/>server action"]
    J --> K{payment method}
    K -->|manual_eft| L["/order-confirmed/[id]<br/>banking details"]
    K -->|payfast disabled| M["/api/payfast/redirect<br/>→ Payfast hosted"]
    M -.->|ITN| N["/api/payfast/itn<br/>status update"]
    L --> O["Manual bank transfer<br/>→ admin confirms — NO UI"]
    B --> P{Auth}
    P --> Q["/login /signup /forgot-password"]
    Q --> R["/account/orders · profile"]
    R --> T["/account/subscriptions · warranties<br/>MOCK DATA"]
    style X stroke:#c00,stroke-dasharray:5 5
    style S stroke:#c00,stroke-dasharray:5 5
    style T stroke:#c00,stroke-dasharray:5 5
    style O stroke:#c00,stroke-dasharray:5 5
```

## 2. Customer purchase flow

```mermaid
sequenceDiagram
    participant C as Customer
    participant UI as Next.js (RSC+client)
    participant LS as localStorage cart
    participant SA as submitCheckout action
    participant DB as Supabase Postgres
    participant EF as Edge fn order-email
    participant RS as Resend
    C->>UI: browse → PDP → configure
    C->>UI: Add to cart
    UI->>LS: write cart item
    C->>UI: /checkout → submit form
    UI->>SA: fields + items + idempotencyKey
    SA->>SA: zod → phone normalize → rateLimit → Turnstile
    SA->>DB: idempotency_key lookup
    SA->>DB: provider enabled? + resolveOrderPricing (server prices)
    SA->>DB: INSERT orders (+trigger)
    DB-->>EF: pg_net POST (x-webhook-secret)
    EF->>RS: owner email [email/both only] + customer email
    SA->>DB: INSERT order_items → payments (compensating delete on fail)
    SA-->>UI: confirmationUrl + whatsappUrl? + paymentRedirectUrl?
    UI->>LS: clearCart
    UI->>C: router.push /order-confirmed/{id}?token=…
```

## 3. Guest checkout flow

```mermaid
flowchart LR
    F[/checkout form/] --> V{zod valid?}
    V -->|no| E1[error banner]
    V -->|yes| P{phone +27?}
    P -->|no| E1
    P -->|yes| R{rate limit ≤5/10m}
    R -->|over| E2[429-style error]
    R -->|ok| T{Turnstile ok?}
    T -->|fail| E1
    T -->|ok/skip| I{idempotency key seen?}
    I -->|yes| RET[return existing order]
    I -->|no| PR{provider enabled?}
    PR -->|no| E3["payment method unavailable"]
    PR -->|yes| RP[resolveOrderPricing]
    RP -->|sold-out/missing product| E4["cart item unavailable"]
    RP -->|ok| O[INSERT order]
    O --> OI[INSERT order_items]
    OI -->|fail| DEL[delete order → error]
    OI -->|ok| PAY[INSERT payments]
    PAY -->|fail| DEL
    PAY -->|ok| OUT{channel}
    OUT -->|whatsapp/both| WA[build wa.me URL → save → window.open]
    OUT -->|email| NO
    WA --> CONF["/order-confirmed/{id}?token="]
    NO --> CONF
```

## 4. Account checkout flow — **MISSING**

```mermaid
flowchart TD
    U[Logged-in customer] --> C[/checkout]
    C --> G["Same guest form — no prefill,<br/>no saved addresses, no account linkage"]
    G --> O[Order created with email field only]
    O --> M{"order.email == auth email?"}
    M -->|yes| H["Visible in /account/orders (RLS email match)"]
    M -->|no| O2["Orphaned from account — invisible forever"]
    style O2 stroke:#c00,stroke-dasharray:5 5
```

## 5. Payment flow with success/failure branches

```mermaid
flowchart TD
    CO[Order created<br/>payment_status=pending] --> SEL{provider}
    SEL -->|manual_eft| EFT["Confirmation page:<br/>bank details + order ref"]
    EFT --> BANK[Customer does EFT offline]
    BANK --> ADMIN["Admin marks paid —<br/>SUPABASE DASHBOARD ONLY"]
    ADMIN --> PAID[payment_status=paid]
    SEL -->|payfast disabled| RED["/api/payfast/redirect<br/>token check → processing"]
    RED --> PF[Payfast hosted page]
    PF -->|customer pays| ITN1["ITN COMPLETE<br/>→ paid + status=completed"]
    PF -->|fails| ITN2["ITN FAILED → failed<br/>(no retry path)"]
    PF -->|cancels| ITN3["ITN CANCELLED → cancelled"]
    PF -->|browser only| RET["return_url → confirmation page<br/>status may still show pending<br/>until ITN lands"]
    ITN1 --> V{verify chain}
    V --> V1[IP allowlist]
    V1 --> V2[MD5 signature]
    V2 --> V3["server→Payfast /eng/query/validate"]
    V3 --> V4[merchant_id + exact amount]
    V4 --> PAID
    style ADMIN stroke:#c00,stroke-dasharray:5 5
    style ITN2 stroke:#c00,stroke-dasharray:5 5
```

## 6. Refund flow — **MISSING**

```mermaid
flowchart LR
    C[Customer wants refund] -.-> X["/contact → 404<br/>or offline WhatsApp/email"]
    X -.-> A["Admin manual bank refund<br/>+ SQL payment_status='refunded'<br/>(enum exists, no writer, no Payfast refund API)"]
    style X stroke:#c00,stroke-dasharray:5 5
    style A stroke:#c00,stroke-dasharray:5 5
```

## 7. Admin order fulfillment flow — **MISSING (dashboard workaround)**

```mermaid
flowchart LR
    N[New order] --> W{"How does the business find out?"}
    W -->|"channel email/both"| EM["Resend email → owner inbox"]
    W -->|"channel whatsapp"| WA2["only if customer opens wa.me<br/>— popup-blockable, unmonitored"]
    EM --> D["Supabase dashboard<br/>table editor"]
    WA2 --> D
    D --> S["Manual SQL: status / payment_status edits<br/>No fulfilment states exist"]
    S --> CC["Contact customer via phone/WhatsApp<br/>to schedule install — untracked"]
    style WA2 stroke:#c00,stroke-dasharray:5 5
    style S stroke:#c00,stroke-dasharray:5 5
```

## 8. Product CRUD flow — **MISSING (dashboard/seed only)**

```mermaid
flowchart LR
    A[Admin] --> B["Supabase table editor /<br/>scripts/seed.ts"]
    B --> P["products (+variants via parent_product_id)<br/>categories / collections / deals"]
    P --> R["RLS: published rows → anon reads"]
    R --> FE[Storefront pages]
    note over B: No validation UI; two coexisting<br/>variant FK behaviours (CASCADE vs SET NULL)
```

## 9. Auth flow (signup, login, reset, verify)

```mermaid
flowchart TD
    SU[/signup form/] --> SA["signup action<br/>pw≥8 + match"]
    SA -->|identities empty| AR["already-registered notice<br/>(anti-enumeration)"]
    SA -->|no session| VC["needsConfirmation →<br/>check email"]
    SA -->|session| R1["redirect safeNext → /account/orders"]
    VC --> CB["/auth/callback?code|token_hash"]
    CB -->|exchange ok| R1
    CB -->|fail| AE["/auth/error → re-request form"]
    L[/login/] --> LP["signInWithPassword"]
    LP -->|err| LE[generic error]
    LP -->|ok| R1
    FP[/forgot-password/] --> RP["resetPasswordForEmail<br/>→ /auth/callback?next=/reset-password"]
    RP --> CB
    RSP[/reset-password/] --> UP["updatePassword<br/>(requires recovery session)"]
    UP --> R1
    MW["middleware every request:<br/>refresh JWT; /account → /login?next=…"]
```

## 10. Cart state machine

See `06-state-machines.md` E1 — `empty → active → converted/abandoned`,
localStorage-only, multi-tab race, invisible to server.

## 11. Order state machine

See `06-state-machines.md` E2 — `submitted → sent_whatsapp|completed|cancelled`;
`email_sent` declared but never written; no fulfilment states.

## 12. Payment state machine

See `06-state-machines.md` E3 — `pending → processing → paid/failed/cancelled`;
`refunded`/`partially_refunded` unreachable; manual-EFT `pending→paid` has no
implemented transition (admin SQL only).

## 13. Inventory sync flow — **MISSING**

```mermaid
flowchart LR
    O[Order placed] -.->|never| SC["products.stock_count<br/>is_sold_out"]
    SC -.->|manual edits only| UI["UI badges +<br/>checkout sold-out rejection"]
    style O stroke:#c00,stroke-dasharray:5 5
```

## 14. Email notification flow

```mermaid
sequenceDiagram
    participant DB as Postgres orders
    participant T as trigger notify_order_email
    participant EF as edge fn order-email
    participant R as Resend
    participant O as Owner inbox
    participant C as Customer
    DB->>T: INSERT
    T->>EF: POST record + x-webhook-secret (secret in git history)
    EF->>EF: channel ∈ {email,both}?<br/>whatsapp → SKIPPED ENTIRELY
    EF->>R: owner email (HTML-escaped)
    EF->>R: customer "request received" (if order.email)
    R->>O: New checkout request
    R->>C: Confirmation
    Note over T: fire-and-forget pg_net —<br/>Resend outage = silent loss
```

## 15. Analytics event flow

```mermaid
flowchart LR
    BAN[CookieConsentBanner<br/>Consent Mode default: denied] -->|accept| GTM[GTM + GA4 load]
    BAN -->|decline/ignore| NONE[no tags, no gtag]
    CP["/order-confirmed mount"] --> LT[LeadTracking]
    LT -->|consent + dedup| EV1["generate_lead<br/>transaction_id, value,<br/>SHA-256 email/phone"]
    WB[WhatsAppButton click] --> EV2["ads conversion send_to"]
    PDP["PDP/cart/checkout views"] -.->|no events| BLIND[Funnel blind:<br/>no view_item/add_to_cart/<br/>begin_checkout/purchase]
    style BLIND stroke:#c00,stroke-dasharray:5 5
```
