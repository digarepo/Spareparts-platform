# Task: REDIS-84 — Distributed lock primitive for coordination (bounded, TTL)
Blueprint: TECH_STACK (coordination without DB contention), Domain AD (Correctness under concurrency)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

packages/infra/redis

## Purpose

Provide a bounded coordination primitive for operations that must be serialized to preserve invariants.

## Implementation Location

* packages/infra/redis/src/locks/lock.service.ts

## Implementation Notes

* Lock must have:
  * unique owner token
  * TTL and refresh semantics
  * best-effort release
* Lock use must be limited to preventing duplicate concurrent processing, not to replace DB transactions.

## Acceptance Criteria

* Lock service exists with clear API.
* Lock misuse is discouraged via naming + docs.

## Dependencies

* REDIS-81

## Estimated Effort

90–180 minutes
