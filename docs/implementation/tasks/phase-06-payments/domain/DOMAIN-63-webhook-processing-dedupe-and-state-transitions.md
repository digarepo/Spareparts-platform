# Task: DOMAIN-63 — Implement webhook processing (signature verified, deduped, explicit transitions)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

domain

## Package / Area

domains/payments

## Purpose

Process provider webhooks safely:
- verify authenticity (signature)
- persist provider event inbox (append-only)
- dedupe/replay protect
- drive explicit payment attempt/payment state transitions

## Implementation Location

* domains/payments/src/webhooks/webhook-handler.usecase.ts
* domains/payments/src/webhooks/webhook-verifier.port.ts
* domains/payments/src/webhooks/provider-event-mapper.ts

## Implementation Notes

* Never trust webhook caller.
* Processing pattern:
  1. verify signature
  2. insert provider event into inbox with unique (provider, provider_event_id)
  3. if already exists, treat as replay and exit cleanly
  4. map provider event to internal attempt/payment transition
  5. apply transition using state machine (explicit + auditable)
* Late events must not rewrite history:
  * if payment is terminal, new events become observations or compensations, not rewrites.

## Acceptance Criteria

* Webhook handling is replay-safe.
* Provider events are persisted before processing.
* Payment transitions follow an explicit state machine.

## Dependencies

* PRISMA-62 — Provider events inbox schema
* CONTRACTS-63 — Provider webhook and event envelope contracts

## Estimated Effort

120–240 minutes
