# Task: REDIS-93 — Cache invalidation guidelines (derived data only)
Blueprint: Domain AD (derived data not authoritative)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

docs/architecture

## Purpose

Define caching guidelines and invalidation strategy so caches never become semantically authoritative.

## Implementation Location

* docs/architecture/cache-guidelines.md

## Implementation Notes

* Prefer cache-aside on read.
* Invalidation can be:
  * TTL-based only (MVP)
  * explicit invalidation hooks for specific read models
* Never block mutations on cache operations.

## Acceptance Criteria

* Guidelines exist and explicitly state failure behavior (fallback to DB).

## Dependencies

* REDIS-89

## Estimated Effort

30–60 minutes
