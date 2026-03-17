# Task: DOMAIN-70 — Implement Fulfillment aggregate and invariants
Blueprint: Domain AI (Fulfillment Core Model & Ownership)
Phase: 07 Fulfillment & Delivery

## Layer

domain

## Package / Area

domains/fulfillment (or domains/logistics)

## Purpose

Implement the Fulfillment domain model as a tenant-owned operational execution artifact that references an order but does not embed payment, inventory, or shipment meaning.

## Implementation Location

* domains/fulfillment/src/fulfillment/fulfillment.aggregate.ts
* domains/fulfillment/src/fulfillment/fulfillment-status.ts

## Implementation Notes

* Fulfillment is tenant-owned:
  * each fulfillment belongs to exactly one tenant
  * platform is supervisor only
* Must reference an order.
* Supports partial fulfillment:
  * fulfillment items reference order lines
  * fulfilled qty must never exceed ordered qty
* Inventory boundary:
  * fulfillment consumes allocated inventory
  * fulfillment must not mutate on-hand inventory

## Acceptance Criteria

* Fulfillment aggregate exists and is framework-agnostic.
* State is modeled as a closed set and transitions are explicit.
* FulfillmentItem references order line ids and enforces quantity invariants.

## Dependencies

* Phase 05 order model
* Phase 04 inventory allocation semantics (allocation exists before fulfillment)

## Estimated Effort

120–240 minutes
