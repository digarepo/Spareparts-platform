# Task: REDIS-90 — Integrate distributed locks for webhook consumers (bounded serialization)
Blueprint: Domain AD (correctness under concurrency), Phase 06 Payments (webhook processing)
Phase: 08 Infrastructure & Runtime

## Layer

integration

## Package / Area

apps/api/src/modules/payments

## Purpose

Prevent concurrent duplicate processing of the same provider event when multiple workers/instances receive overlapping deliveries.

## Implementation Location

* apps/api/src/modules/payments/webhooks/*.ts

## Implementation Notes

* Lock scope must be narrow:
  * per provider_event_id
  * per environment
* Lock TTL must be short and explicit.
* Lock is coordination only; authoritative dedupe remains in Postgres inbox.

## Acceptance Criteria

* Only one instance processes a given event at a time.
* Failure paths do not produce partial domain transitions.

## Dependencies

* REDIS-84
* Phase 06 provider inbox schema

## Estimated Effort

45–90 minutes
