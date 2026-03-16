# Task: RLS-72 — Customer read-only visibility for tracking + delivery confirmation
Blueprint: Domain AK (Delivery & Tracking Governance)
Phase: 07 Fulfillment & Delivery

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Allow customers to observe tracking and delivery confirmation for their own shipments without granting mutation authority.

## Implementation Location

* packages/db/rls/fulfillment-delivery.sql

## Implementation Notes

* Customer visibility should be derived from the order/customer linkage.
* Customers must not be able to append tracking events or confirm delivery.

## Acceptance Criteria

* Customers can read tracking events and delivery confirmation for their own shipments.
* Customers cannot mutate any fulfillment/logistics records.

## Dependencies

* RLS-70
* Phase 05 order ownership policies

## Estimated Effort

45–90 minutes
