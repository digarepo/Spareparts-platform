# Task: REDIS-87 — Redis-backed rate limiter implementation
Blueprint: Domain AC (rate limiting semantics), TECH_STACK (rate limiting)
Phase: 08 Infrastructure & Runtime

## Layer

security

## Package / Area

packages/infra/redis

## Purpose

Implement a Redis-backed rate limiting service usable by API middleware and worker job ingestion.

## Implementation Location

* packages/infra/redis/src/ratelimit/rate-limit.service.ts

## Implementation Notes

* Support separate policies by:
  * actor type
  * tenant_id
  * route group
* Returned decision must be explicit.
* Must not introduce partial execution.

## Acceptance Criteria

* Rate limiter supports fixed-window or sliding-window with TTL.
* Unit tests cover key generation and TTL behavior.

## Dependencies

* REDIS-81
* REDIS-85

## Estimated Effort

90–180 minutes
