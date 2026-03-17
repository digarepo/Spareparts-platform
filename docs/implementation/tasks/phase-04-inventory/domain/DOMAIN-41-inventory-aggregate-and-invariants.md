# Task: DOMAIN-41 — Implement Inventory aggregate semantics and invariants
Blueprint: Domain K (Inventory Core Model)
Phase: 04 Inventory

## Layer

domain

## Package / Area

domains/inventory

## Purpose

Implement the inventory domain model so inventory has unambiguous meaning, strict separation from catalog/pricing/order/payment, and enforces core invariants:
- quantities are discrete integers
- no negative inventory
- inventory is tenant-owned and tenant-scoped

## Implementation Location

* domains/inventory/src/inventory.aggregate.ts (or equivalent)
* domains/inventory/src/value-objects/* (if used)

## Implementation Notes

* Model inventory as an aggregate:
  * stable identity
  * tenant scope as part of the aggregate identity
  * references catalog variant by ULID identifier
* Represent quantity concepts separately:
  * on-hand
  * reserved
  * allocated
  * derived: available
* Invariants:
  * all quantities are integers
  * on-hand >= 0
  * reserved >= 0
  * allocated >= 0
  * reserved + allocated <= on-hand
* Do not embed:
  * pricing logic
  * order/payment meaning
  * fulfillment meaning

## Acceptance Criteria

* Inventory aggregate exists and can represent inventory state for (tenant_id, variant_id)
* Invariants are enforced in domain methods (attempts to violate them are rejected)
* Available quantity is derived consistently from on-hand/reserved/allocated
* No imports from applications or infrastructure layers

## Dependencies

* PRISMA-41 — Define inventory and reservation persistence schema
* CONTRACTS-44 — Inventory snapshot contracts (for shape alignment)

## Estimated Effort

60–120 minutes
