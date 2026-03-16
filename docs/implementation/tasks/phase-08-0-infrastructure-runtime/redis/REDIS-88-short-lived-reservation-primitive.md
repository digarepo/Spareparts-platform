# Task: REDIS-88 — Short-lived reservation primitive (ephemeral safety only)
Blueprint: TECH_STACK (short-lived reservations), Domain AD (source-of-truth supremacy)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

packages/infra/redis

## Purpose

Provide an ephemeral reservation capability for coordinating short-lived holds without DB contention, while keeping Postgres as the only authoritative store.

## Implementation Location

* packages/infra/redis/src/reservations/reservation.service.ts

## Implementation Notes

* Reservation must be:
  * TTL-bound
  * explicitly keyed
  * best-effort cleanup
* Must never be used to represent authoritative inventory.
* When Redis is unavailable, the system must fail closed for reservation-required flows.

## Acceptance Criteria

* Reservation API supports acquire/release/extend.
* TTL behavior is explicit and testable.

## Dependencies

* REDIS-81
* REDIS-85

## Estimated Effort

90–180 minutes
