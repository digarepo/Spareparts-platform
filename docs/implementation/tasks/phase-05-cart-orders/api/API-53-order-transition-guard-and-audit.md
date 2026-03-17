# Task: API-53 — Implement checkout/order transition guard and audit logging
Blueprint: Domain C (Identity, Scope, Authorization), Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

api

## Package / Area

apps/api/src/http/guards

## Purpose

Enforce explicit authority for checkout and governed order transitions and ensure failures/outcomes are auditable.

## Implementation Location

* apps/api/src/http/guards/checkout.guard.ts
* apps/api/src/http/guards/order-transition.guard.ts
* apps/api/src/modules/checkout/*

## Implementation Notes

* Guards must:
  * enforce scope-first authorization
  * deny-by-default
  * prevent implicit order creation
* Audit logging must capture:
  * actor
  * scope
  * intent
  * outcome

## Acceptance Criteria

* Unauthorized requests are rejected with clear 4xx
* Authorized requests proceed
* All attempts emit audit records (success/failure)

## Dependencies

* CONTRACTS-54 — Checkout transition contracts
* CONTRACTS-55 — Order event and audit contracts
* PRISMA-52 — Define order event/audit persistence schema

## Estimated Effort

60–120 minutes
