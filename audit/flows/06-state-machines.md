# State Machines (as-implemented)

## E1. Cart state — `localStorage` only

```mermaid
stateDiagram-v2
    [*] --> Empty
    Empty --> Active : addItem (PDP / related products / recommendations)
    Active --> Active : updateQty / removeItem / addItem
    Active --> Empty : removeItem(last) / clearCart
    Active --> Converted : submitCheckout success → clearCart
    Active --> Abandoned : browser closed (invisible to server)
    Converted --> Empty
    Abandoned --> Active : same-browser revisit (localStorage persists)
    note right of Abandoned
        Server never sees the cart — no recovery,
        no analytics, no reminder possible.
        Multi-tab edits race (last writer wins).
    end note
```

**Gap:** `Abandoned` is observable only to the user's own browser.

## E2. Order state — `orders.status`

```mermaid
stateDiagram-v2
    [*] --> submitted : submitCheckout INSERT
    submitted --> sent_whatsapp : markWhatsAppSent (token-verified)
    submitted --> completed : Payfast ITN COMPLETE (conflates paid+fulfilled)
    submitted --> cancelled : admin SQL (no UI) / 90-day PII cron
    sent_whatsapp --> completed : ITN COMPLETE
    sent_whatsapp --> cancelled : admin SQL
    completed --> [*]
    cancelled --> [*]
    note right of submitted
        Enum: submitted | sent_whatsapp | email_sent | completed | cancelled
        'email_sent' is declared but never written.
        No fulfilment states: nothing between "paid" and "done".
    end note
```

## E3. Payment state — `orders.payment_status` (mirror: `payments.status`)

```mermaid
stateDiagram-v2
    [*] --> pending : submitCheckout
    pending --> processing : /api/payfast/redirect (Payfast only)
    pending --> paid : manual EFT confirm — ADMIN SQL ONLY, no app path
    pending --> failed : ITN FAILED
    pending --> cancelled : ITN CANCELLED
    processing --> paid : ITN COMPLETE
    processing --> failed : ITN FAILED
    processing --> cancelled : ITN CANCELLED
    paid --> refunded : (enum exists — no writer)
    paid --> partially_refunded : (enum exists — no writer)
    failed --> [*] : terminal — no retry path
    cancelled --> [*] : terminal
    note right of pending
        No terminal-state guard: a late COMPLETE ITN can
        resurrect a cancelled order to paid.
        Manual EFT pending → paid transition has NO
        implemented trigger — Critical operational gap.
    end note
```

## E4. User state — `auth.users`

```mermaid
stateDiagram-v2
    [*] --> Guest : browse/cart/checkout (no account needed)
    Guest --> Registered : signup (identities>0)
    Registered --> Verified : /auth/callback code exchange
    Registered --> Registered : already-registered → fake success
    Verified --> Active : first login / any login
    Active --> Active : JWT refresh via middleware
    Active --> Guest : signOut
    Active --> Suspended : (no states exist)
    Active --> Deleted : (no self-serve; dashboard admin delete only)
    note right of Registered
        'Verified' is Supabase-managed — app treats
        session as sufficient; orders never link by
        user_id, only by email string match.
    end note
```

## E5. Inventory state — per product row

```mermaid
stateDiagram-v2
    [*] --> InStock : stock_count > low_stock_threshold
    InStock --> Low : stock_count <= low_stock_threshold
    InStock --> Out : is_sold_out = true (manual)
    Low --> Out : is_sold_out = true (manual)
    Out --> InStock : is_sold_out = false (manual)
    InStock --> Discontinued : is_published = false (manual)
    note right of InStock
        ALL transitions are manual — orders never
        decrement, no backorder state, no
        back-in-stock notification.
    end note
```

## Cross-cutting state risks

| Risk | Evidence |
|---|---|
| `status='completed'` conflates "payment received" with "fulfilled" — customer sees "Completed" the moment ITN lands, weeks before installation | `itn/route.ts:108` |
| `orders` ↔ `payments` status pairs updated non-atomically → divergent states possible | `itn/route.ts:102-131`, `redirect/route.ts:68-77` |
| `orders.items` JSONB ↔ `order_items` duplicated sources | `actions.ts:286-351` |
| No terminal guard on ITN replay (cancelled→paid resurrection) | `itn/route.ts:100-160` |
| `expires_at` is a read-gate not a state — expired EFT-paid orders just 404 | `order-confirmed/[token]/page.tsx:126-131` |
