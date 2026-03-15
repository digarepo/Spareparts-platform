# Task: CONTRACTS-64 — Refund + reversal contracts (additive, never destructive)
Blueprint: Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

contracts

## Package / Area

packages/contracts/src/payments

## Purpose

Define explicit contracts for refunds and reversals such that:
- refunds reference a settled payment
- reversals are additive compensating actions
- history is never rewritten or deleted

This capability is **not part of the MVP** for your current Phase 06 scope.
This task exists to predefine the correct, blueprint-compliant contract shapes for a later phase.

## Implementation Location

* packages/contracts/src/payments/refund.schema.ts
* packages/contracts/src/payments/reversal.schema.ts

## Implementation Notes

* Refund vs reversal distinction is binding.
* Both actions must include:
  * stable ULID ids
  * reason classification (string enum)
  * money primitives
  * references to payment/payment attempt/provider event as applicable

## Acceptance Criteria

* Refund schema exists and forbids referencing non-settled payments.
* Reversal schema exists as compensating action.
* Schemas are present but **no endpoints/use cases are required for MVP**.

## Dependencies

* CONTRACTS-61

## Estimated Effort

45–90 minutes
