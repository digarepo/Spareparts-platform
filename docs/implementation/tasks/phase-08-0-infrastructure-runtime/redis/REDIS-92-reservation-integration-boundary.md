# Task: REDIS-92 — Define reservation integration boundary (where Redis reservations are allowed)
Blueprint: TECH_STACK (short-lived reservations), Domain AD (source of truth), Phase 04/05 boundaries
Phase: 08 Infrastructure & Runtime

## Layer

infrastructure

## Package / Area

docs/architecture

## Purpose

Define where Redis “short-lived reservations” are allowed so they do not reintroduce implicit inventory reservation semantics.

## Implementation Location

* docs/architecture/redis-reservations-boundary.md

## Implementation Notes

* Must be explicit that:
  * inventory authority remains in Postgres
  * Redis reservations are safety/coordination only
  * any reservation affecting customer-visible outcomes must have an authoritative record

## Acceptance Criteria

* Document exists and is referenced by inventory/checkout/payment tasks.

## Dependencies

* REDIS-80

## Estimated Effort

30–60 minutes
