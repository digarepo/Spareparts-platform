# Task: REDIS-89 — Cache-aside helper + safe serialization
Blueprint: Domain AD (derived data is not authoritative), Domain AC (hardening without semantic mutation)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

packages/infra/redis

## Purpose

Provide a reusable cache-aside helper that standardizes serialization, TTL, and error handling.

## Implementation Location

* packages/infra/redis/src/cache/cache-aside.ts

## Implementation Notes

* Caching must be optional:
  * cache miss -> compute via authoritative store
  * cache failure -> fall back to authoritative store
* Cached values must be treated as derived and non-authoritative.

## Acceptance Criteria

* Helper supports typed encode/decode and TTL.
* Cache errors never change domain outcomes.

## Dependencies

* REDIS-81

## Estimated Effort

60–120 minutes
