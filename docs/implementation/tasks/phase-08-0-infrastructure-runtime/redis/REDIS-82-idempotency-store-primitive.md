# Task: REDIS-82 — Idempotency store primitive (SETNX + TTL)
Blueprint: TECH_STACK (idempotency keys), Domain AD (Idempotency and replay safety)
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

packages/infra/redis

## Purpose

Implement a reusable idempotency primitive for endpoints and job handlers.

## Implementation Location

* packages/infra/redis/src/idempotency/idempotency-store.ts

## Implementation Notes

* Must support:
  * acquire (create key if absent)
  * record outcome hash / pointer to authoritative DB record
  * TTL expiry
* Must not store authoritative results; only references.

## Acceptance Criteria

* Library API exists and is used by payments webhooks and checkout.
* Duplicate requests resolve deterministically.

## Dependencies

* REDIS-81

## Estimated Effort

90–180 minutes
