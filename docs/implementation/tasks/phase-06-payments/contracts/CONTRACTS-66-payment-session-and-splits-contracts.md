# Task: CONTRACTS-66 — Payment session + per-tenant split contracts (single customer payment)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

contracts

## Package / Area

packages/contracts/src/payments

## Purpose

Define contracts for a single customer payment session that covers one order total, while the platform internally tracks a per-tenant obligation split.

This preserves the blueprint rule that **obligation meaning remains per-tenant**, without forcing the customer to pay multiple times.

## Implementation Location

* packages/contracts/src/payments/payment-session.schema.ts
* packages/contracts/src/payments/payment-split.schema.ts

## Implementation Notes

* `PaymentSession` represents the customer-facing “pay once” artifact:
  * references order_id
  * has total amount (minor units + currency)
  * includes provider-facing artifacts (opaque)
  * has explicit lifecycle
* `PaymentSplit` represents internal obligation breakdown:
  * one session -> N splits
  * each split has tenant_id, amount_minor, currency
  * split is immutable once created
* Splits must never allow cross-tenant pooling for downstream release/settlement decisions.

## Acceptance Criteria

* PaymentSession schema exists and uses ULID identifiers.
* PaymentSplit schema exists, references tenant obligations, and is immutable in meaning.
* Schemas do not imply order creation/cancellation.

## Dependencies

* CONTRACTS-61 — Payments identifiers and money primitives

## Estimated Effort

60–120 minutes
