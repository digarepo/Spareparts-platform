# Task: DOMAIN-45 — Implement inventory sellability governance
Blueprint: Domain L (Inventory Availability & Reservation), Domain M (Inventory Governance & Consistency)
Phase: 04 Inventory

## Layer

domain

## Package / Area

domains/inventory

## Purpose

Model and enforce the rule that sellability is an explicit operational decision distinct from quantity states.

Sellability changes must be governed actions and must produce an audit/event record.

## Implementation Location

* domains/inventory/src/inventory.service.ts
* domains/inventory/src/events/*

## Implementation Notes

* Implement domain method to set sellability:
  * inputs include tenant_id, variant_id, sellable boolean, reason
  * fail closed on invalid inputs
  * emit an inventory event capturing intent/outcome
* Sellability must not:
  * be inferred automatically from on-hand/available
  * imply pricing/publication/authorization

## Acceptance Criteria

* Domain method exists to set sellability explicitly
* Changes produce an inventory event/audit record
* Sellability state is persisted via Prisma model

## Dependencies

* PRISMA-44 — Add explicit sellability field to inventory schema
* CONTRACTS-45 — Inventory sellability and policy contracts
* DOMAIN-44 — Inventory events and audit trail semantics

## Estimated Effort

45–90 minutes
