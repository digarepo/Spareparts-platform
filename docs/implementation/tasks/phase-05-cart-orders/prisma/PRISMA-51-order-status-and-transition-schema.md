# Task: PRISMA-51 — Define order status and transition persistence
Blueprint: Domain P (Order Transitions, Governance & Failure Semantics)
Phase: 05 Cart & Orders

## Layer

prisma

## Package / Area

packages/db (Prisma schema)

## Purpose

Persist explicit order lifecycle states and support governed transitions without rewriting order history.

## Implementation Location

* packages/db/prisma/schema.prisma
* packages/db/prisma/migrations/*

## Implementation Notes

* Add an explicit order status field with a finite set of allowed values.
* Ensure failure vs cancellation are structurally distinct (status values and event records).
* Prefer recording transitions in an append-only events table rather than overwriting historical fields.

## Acceptance Criteria

* Order model includes an explicit status enum
* Schema supports recording explicit failure/cancellation outcomes
* Migration can be generated/applied without errors

## Dependencies

* PRISMA-50 — Define cart and order persistence schema
* CONTRACTS-55 — Order event and audit contracts

## Estimated Effort

45–90 minutes
