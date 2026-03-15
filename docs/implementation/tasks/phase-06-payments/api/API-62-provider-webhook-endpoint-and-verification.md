# Task: API-62 — Provider webhook endpoint + verification (replay safe)
Blueprint: Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose a hardened webhook endpoint for payment provider callbacks.

This endpoint must:
- verify provider signatures
- be replay-safe via provider event inbox
- never trust caller identity

## Implementation Location

* apps/api/src/modules/payments/payments-webhook.controller.ts
* apps/api/src/http/middleware/payment-webhook-verification.middleware.ts

## Implementation Notes

* Verification must happen before parsing/processing business data.
* Processing should delegate to domain use case that:
  * persists provider event
  * dedupes
  * applies state transition
* Do not require tenant/customer auth; use provider verification instead.

## Acceptance Criteria

* Webhook endpoint exists (e.g., POST /payments/webhook).
* Signature verification is enforced.
* Duplicate provider events are safely ignored.

## Dependencies

* CONTRACTS-63 — Provider webhook + event envelope contracts
* DOMAIN-63 — Webhook processing use case

## Estimated Effort

60–120 minutes
