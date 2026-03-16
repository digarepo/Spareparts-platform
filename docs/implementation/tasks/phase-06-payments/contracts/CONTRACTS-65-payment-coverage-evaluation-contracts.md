# Task: CONTRACTS-65 — Payment coverage evaluation contracts (per-tenant obligation)
Blueprint: Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

contracts

## Package / Area

packages/contracts/src/payments

## Purpose

Define contracts that represent the explicit evaluation of whether an order obligation has been financially satisfied.

This must be:
- explicit (never inferred from payment state alone)
- per-tenant obligation (no cross-tenant collapse)
- auditable and reconstructable

## Implementation Location

* packages/contracts/src/payments/payment-coverage.schema.ts

## Implementation Notes

* Coverage evaluation should include:
  * order_id
  * tenant_id (obligation scope)
  * amount_due (minor units + currency)
  * amount_covered
  * coverage_status (insufficient/partial/complete)
  * evaluated_at
  * references to contributing payment ids

## Acceptance Criteria

* Coverage evaluation schema exists.
* Coverage status is an explicit closed set.

## Dependencies

* CONTRACTS-61

## Estimated Effort

45–90 minutes
