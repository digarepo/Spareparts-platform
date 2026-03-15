# Task: REDIS-91 — Integrate idempotency keys for checkout + order commitment endpoints
Blueprint: Domain AD (idempotency), Phase 05 Cart/Orders
Phase: 08 Infrastructure & Runtime

## Layer

integration

## Package / Area

apps/api/src/modules/orders

## Purpose

Ensure checkout and order commitment endpoints are retry-safe and do not create duplicate commitments under network retries.

## Implementation Location

* apps/api/src/modules/orders/checkout.controller.ts
* apps/api/src/modules/orders/checkout.service.ts

## Implementation Notes

* Idempotency key must be:
  * client supplied (preferred)
  * scoped to customer + cart intent id
  * TTL-bound
* Result must reference authoritative order id.

## Acceptance Criteria

* Replayed requests return the same committed order id.
* Duplicate commitments are prevented.

## Dependencies

* REDIS-82
* Phase 05 checkout transition

## Estimated Effort

60–120 minutes
