# Task: CONTRACTS-72 — Fulfillment contracts (tenant-owned operational execution)
Blueprint: Domain AI (Fulfillment Core Model & Ownership)
Phase: 07 Fulfillment & Delivery

## Layer

contracts

## Package / Area

packages/contracts/src/fulfillment-delivery

## Purpose

Define contracts for fulfillment creation, retrieval, item composition, and explicit state transitions.

Fulfillment is operational and tenant-owned. It must not embed payment state or inventory mutation semantics.

## Implementation Location

* packages/contracts/src/fulfillment-delivery/fulfillment.schema.ts
* packages/contracts/src/fulfillment-delivery/fulfillment-commands.schema.ts

## Implementation Notes

* Fulfillment references:
  * order_id
  * tenant_id
  * explicit fulfillment items referencing order lines
* Support partial fulfillment:
  * bounded by order quantities
* State transitions must be explicit and validated.

## Acceptance Criteria

* Fulfillment create/query schemas exist.
* Fulfillment state transition command schemas exist.
* ULID identifiers enforced.

## Dependencies

* CONTRACTS-71

## Estimated Effort

60–120 minutes
