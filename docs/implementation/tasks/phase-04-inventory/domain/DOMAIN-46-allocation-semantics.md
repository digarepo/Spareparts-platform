# Task: DOMAIN-46 — Implement allocation semantics (commit and release)
Blueprint: Domain L (Inventory Availability & Reservation), Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

domain

## Package / Area

domains/inventory

## Purpose

Implement allocation as an explicit domain operation distinct from reservation.

Allocation represents committed assignment of inventory for downstream execution and must:
- be bounded by available quantity
- be auditable as a governed action
- not imply fulfillment completion or payment success

## Implementation Location

* domains/inventory/src/inventory.service.ts
* domains/inventory/src/events/*

## Implementation Notes

* Allocation commit must:
  * reference tenant_id + variant_id
  * validate quantity is positive integer
  * increase allocated and reduce available
  * reject if it would violate invariants
  * emit an allocation event
* Allocation release must:
  * explicitly decrease allocated
  * emit an allocation release event
* Concurrency:
  * design to support transactional enforcement

## Acceptance Criteria

* Domain methods exist:
  * allocate inventory
  * release allocation
* Allocation cannot exceed available quantity
* Allocation events are produced and align with event contracts

## Dependencies

* DOMAIN-41 — Inventory aggregate semantics and invariants
* CONTRACTS-46 — Inventory allocation contracts
* DOMAIN-44 — Inventory events and audit trail semantics

## Estimated Effort

60–120 minutes
