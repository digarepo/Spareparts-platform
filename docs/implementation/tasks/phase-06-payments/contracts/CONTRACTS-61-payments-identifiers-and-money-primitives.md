# Task: CONTRACTS-61 — Payments identifiers + money primitives (ULID + minor units)
Blueprint: Domain Q (Payment Core Model & Meaning)
Phase: 06 Payments

## Layer

contracts

## Package / Area

packages/contracts/src/payments

## Purpose

Define the foundational primitives for money-safe payments:
- stable ULID-based identifiers
- currency codes
- amounts expressed in minor units
- explicit invariants that forbid ambiguous money representation

## Implementation Location

* packages/contracts/src/payments/payment-identifiers.schema.ts
* packages/contracts/src/payments/money.schema.ts

## Implementation Notes

* Identifiers must be ULID strings:
  * PaymentId
  * PaymentAttemptId
  * ProviderEventId
  * RefundId
  * ReversalId
* Money representation:
  * prefer integer minor units (e.g., cents) to avoid floating point
  * include currency as ISO 4217 code (string enum or refinement)
  * explicitly forbid NaN/float usage in contracts
* Include examples in JSDoc for all exports.

## Acceptance Criteria

* All IDs are validated as ULID strings.
* Money schema uses integer minor units + explicit currency.
* Money schema rejects negative values where not meaningful.

## Dependencies

* CONTRACTS-60

## Estimated Effort

45–90 minutes
