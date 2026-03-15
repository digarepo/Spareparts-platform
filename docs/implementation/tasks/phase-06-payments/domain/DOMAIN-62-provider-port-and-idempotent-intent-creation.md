# Task: DOMAIN-62 — Implement provider port + idempotent payment intent creation
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

domain

## Package / Area

domains/payments

## Purpose

Create an explicit provider port and implement idempotent creation of payment intents/attempts.

This must:
- be safe under retries
- never create duplicate payment meaning for the same idempotency key
- be provider-agnostic at the domain boundary

## Implementation Location

* domains/payments/src/provider/payment-provider.port.ts
* domains/payments/src/payment/create-payment-intent.usecase.ts

## Implementation Notes

* The use case should accept:
  * order_id
  * tenant_id (obligation scope)
  * customer context
  * amount (minor units + currency)
  * idempotency_key
* Create or reuse a PaymentAttempt:
  * if attempt with (payment_id, idempotency_key) exists, return the same output
  * otherwise create a new attempt and call provider
* Provider outputs must be stored as provider references, not used as internal identifiers.

## Acceptance Criteria

* Provider port exists.
* Payment intent creation is idempotent.
* Returned client secret/token is treated as opaque provider artifact.

## Dependencies

* PRISMA-61 — Payment attempts and idempotency schema
* CONTRACTS-62 — Payment intent and attempt contracts

## Estimated Effort

120–240 minutes
