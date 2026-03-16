# Task: CONTRACTS-62 — Payment intent + attempt contracts (idempotent, tenant-obligation scoped)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics), Domain S (Payment–Order Integrity & Failure Semantics)
Phase: 06 Payments

## Layer

contracts

## Package / Area

packages/contracts/src/payments

## Purpose

Define request/response contracts for initiating and tracking a payment attempt for a specific tenant obligation within an order.

## Implementation Location

* packages/contracts/src/payments/payment-intent.schema.ts
* packages/contracts/src/payments/payment-attempt.schema.ts

## Implementation Notes

* Payment must reference exactly one order obligation and be associated with an explicit tenant scope.
* Include idempotency key support in the request (string) for safe retries.
* Separate:
  * payment intent (pre-settlement intent)
  * payment attempt (provider-facing technical attempt)
* Do not imply order success/failure from payment state.

## Acceptance Criteria

* Intent/attempt schemas exist with ULID ids and money primitives.
* Request contains explicit order reference + tenant obligation scope.
* Response can include provider-specific client secret/token in a provider-agnostic field.

## Dependencies

* CONTRACTS-61

## Estimated Effort

60–120 minutes
