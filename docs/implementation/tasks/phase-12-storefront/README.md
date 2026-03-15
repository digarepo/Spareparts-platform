# Phase 12 — Storefront (Customer UI)

This phase implements the customer-facing Storefront UI in `apps/storefront`.

## Principles (authoritative)

- API-first frontend; the UI is a consumer, not an authority.
- Guest checkout is supported and must remain available.
- Customer accounts are optional and provide convenience benefits.
- Multi-tenant cart is supported; UI must clearly show per-seller grouping and totals.
- Search is non-authoritative discovery only; search failure must degrade visibility, not block checkout.
- Cart is intent (ephemeral) and may be stale; staleness must be explicit and never silently corrected.
- Orders define obligation; payment outcomes are downstream and must not be used to infer order truth.
- Notifications are informational only and must never be modeled as business state.

## MVP-complete (definition for this phase)

After completing Phase 12 tasks, the Storefront should be considered MVP-complete if:

- SSR is enabled for SEO with correct metadata and stable server rendering.
- Home, search, category browsing, product detail, cart, checkout (guest), and order confirmation/failure flows are implemented.
- Cart supports multi-tenant grouping and explicit staleness reconciliation before order creation/checkout.
- Checkout supports payment attempts and safe failure recovery without implying order cancellation.
- Optional account surfaces exist (sign-in, orders list, order detail) without making accounts mandatory.
- Degraded mode behavior is explicit (search outages, payment failures, API failures).

## Task numbering convention

Files in this phase use IDs of the form `STOREUI12-###`.
