# Task: REDIS-80 — Redis adoption scope and non-goals
Blueprint: TECH_STACK (Caching & Coordination), Domain AD (Source-of-Truth Supremacy), Domain AC (Hardening Without Semantic Mutation)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

packages/infra/redis

## Purpose

Define explicit Redis responsibilities and enforce the hard boundary that Redis is never a source of truth.

## Implementation Location

* docs/architecture/redis-scope.md
* packages/infra/redis/src/redis.boundaries.ts

## Implementation Notes

* Redis is used only for:
  * idempotency keys
  * coordination without DB contention
  * rate limiting
  * short-lived reservations (ephemeral safety only)
* Redis must not:
  * store authoritative balances, orders, payments, inventory truth
  * replace Postgres constraints / RLS
  * introduce alternate execution paths

## Acceptance Criteria

* Written policy exists and is referenced by infra tasks.
* A shared boundary guard exists to prevent misuse in code reviews.

## Dependencies

* TECH_STACK.md

## Estimated Effort

45–90 minutes
