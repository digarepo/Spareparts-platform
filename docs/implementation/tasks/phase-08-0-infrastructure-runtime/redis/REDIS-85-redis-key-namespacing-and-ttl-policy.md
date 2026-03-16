# Task: REDIS-85 — Redis key namespacing + TTL policy
Blueprint: TECH_STACK (coordination, idempotency), Domain B (environment isolation), Domain AD (temporal integrity)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

packages/infra/redis

## Purpose

Define a consistent Redis key scheme to prevent collisions, enforce environment separation, and standardize TTL decisions.

## Implementation Location

* packages/infra/redis/src/keys/redis-keys.ts

## Implementation Notes

* Key namespace must include:
  * environment
  * tenant_id when applicable
  * feature area (idempotency, ratelimit, lock, reservation, cache)
* TTLs must be explicit per feature area.
* No unbounded keys.

## Acceptance Criteria

* Key builders exist and are used by all Redis primitives.
* TTL is mandatory for ephemeral keys.

## Dependencies

* REDIS-81

## Estimated Effort

45–90 minutes
