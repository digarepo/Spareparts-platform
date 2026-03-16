# Task: API-43 — Implement reservation create/release endpoints (tenant-scoped)
Blueprint: Domain L (Inventory Availability & Reservation)
Phase: 04 Inventory

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose tenant-scoped endpoints to create and release reservations as explicit operational actions.

Reservations must remain revocable claims against availability and must not be conflated with allocations or fulfillment.

## Implementation Location

* apps/api/src/modules/inventory/inventory.controller.ts
* apps/api/src/modules/inventory/inventory.service.ts

## Implementation Notes

* Validate requests using reservation contracts.
* Enforce tenant context and deny-by-default.
* Ensure reservation operations are safe under retries and concurrency.
* Record audit/events for reservation creation/release.

## Acceptance Criteria

* Endpoints exist:
  * create reservation
  * release reservation
* Requests validated via contracts
* Responses conform to reservation response contracts
* Reservation cannot exceed available inventory
* Audit/event records are produced

## Dependencies

* CONTRACTS-43 — Inventory reservation contracts
* DOMAIN-42 — Reservation lifecycle and logic
* DOMAIN-44 — Inventory events and audit trail semantics
* RLS-43 — Guarded mutation policies for inventory operations

## Estimated Effort

60–120 minutes
