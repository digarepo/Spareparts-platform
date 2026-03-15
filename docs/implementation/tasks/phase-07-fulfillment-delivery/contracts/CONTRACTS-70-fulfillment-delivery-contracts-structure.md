# Task: CONTRACTS-70 — Fulfillment & delivery contracts structure
Blueprint: Domain AI (Fulfillment Core Model & Ownership), Domain AJ (Shipment Logistics Model), Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

contracts

## Package / Area

packages/contracts/src/fulfillment-delivery

## Purpose

Establish the contracts module structure for Fulfillment, Shipment, Tracking, and Delivery confirmation.

This phase must enforce:
- stable ULID identifiers
- tenant isolation (fulfillment/shipment are tenant-scoped)
- append-only event semantics for tracking
- explicit state transitions (no implicit mutation)

## Implementation Location

* packages/contracts/src/fulfillment-delivery/

## Implementation Notes

* Use grouped modules:
  * identifiers
  * fulfillment (create/query/state transitions)
  * shipment (create/query/state transitions)
  * tracking + delivery confirmation (append-only)
* Ensure contracts do not embed payment/order business meaning beyond references.

## Acceptance Criteria

* Folder and grouped-module plan is defined.
* ULID enforcement is required for all identifiers.

## Dependencies

* CONTRACTS-51/53 (Order identifiers/contracts) for references

## Estimated Effort

30–60 minutes
