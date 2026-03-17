# Task: DOMAIN-60 — Implement Payment aggregate + invariants (meaning stability)
Blueprint: Domain Q (Payment Core Model & Meaning)
Phase: 06 Payments

## Layer

domain

## Package / Area

domains/payments

## Purpose

Implement the core Payment aggregate so payment meaning is explicit, stable, and auditable.

The aggregate must enforce the hard boundary:
- payment state is a financial fact
- it must not create/cancel/redefine orders, inventory, or fulfillment

## Implementation Location

* domains/payments/src/payment/payment.aggregate.ts
* domains/payments/src/payment/payment-status.ts
* domains/payments/src/payment/payment-types.ts

## Implementation Notes

* Identity:
  * PaymentId is ULID string
  * stable identity; never reused
* Scope:
  * payment references exactly one order obligation and has explicit tenant scope
  * multi-tenant orders imply multiple tenant-scoped payments, not a pooled payment
* Money safety:
  * represent amounts in minor units + currency
  * totals and comparisons must be integer-safe
* Lifecycle:
  * define a closed set of conceptual state categories per Domain Q
  * transitions must be explicit decisions, not inferred from technical artifacts
* Immutability in meaning:
  * avoid “editing” payments to change what the payment was for
  * model corrections as additive refunds/reversals (Domain S)

## Acceptance Criteria

* Payment aggregate exists and is framework-agnostic.
* Illegal state transitions are rejected.
* Payment-to-order reference and tenant scope are required and stable.
* Money primitives are used consistently (minor units + currency).

## Dependencies

* PRISMA-60 — Payments core schema
* CONTRACTS-61 — Payments identifiers and money primitives

## Estimated Effort

90–180 minutes
