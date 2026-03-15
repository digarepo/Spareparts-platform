# Task: RLS-70 — Enable RLS on fulfillment/delivery tables
Blueprint: Domain AI (Fulfillment Core Model & Ownership), Domain AJ (Shipment Logistics Model), Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Enable row-level security on fulfillment/delivery tables to enforce tenant isolation at the database layer.

## Implementation Location

* packages/db/rls/fulfillment-delivery.sql

## Implementation Notes

* Enable RLS on:
  * fulfillments
  * fulfillment_items
  * fulfillment_status_history
  * shipments
  * shipment_status_history
  * tracking_events
  * delivery_confirmations
* Default deny.

## Acceptance Criteria

* RLS enabled on all fulfillment/delivery tables.
* No table is readable without policies.

## Dependencies

* PRISMA-70..74

## Estimated Effort

30–60 minutes
