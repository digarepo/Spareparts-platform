# Task: REDIS-83 — Integrate Redis idempotency for payments webhooks and provider callbacks
Blueprint: Domain AD (Replay safety), Phase 06 Payments (webhooks)
Phase: 08 Infrastructure & Runtime

## Layer

integration

## Package / Area

apps/api/src/modules/payments

## Purpose

Ensure webhook processing is replay-safe and deduplicated using Redis idempotency keys without changing payment semantics.

## Implementation Location

* apps/api/src/modules/payments/webhooks/*.ts

## Implementation Notes

* Key format must include:
  * provider
  * provider_event_id (or equivalent)
  * environment
* Deduplication must still persist an authoritative inbox record in Postgres.

## Acceptance Criteria

* Duplicate webhook delivery does not produce duplicate state transitions.
* Missing Redis does not corrupt state (must fail closed or fallback to DB inbox constraints).

## Dependencies

* REDIS-82
* Phase 06 provider event inbox schema (PRISMA-62)

## Estimated Effort

60–120 minutes
