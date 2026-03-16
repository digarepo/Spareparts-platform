# Task: API-45 — Implement inventory audit logging integration
Blueprint: Domain M (Inventory Governance & Consistency), Domain AD (Data Integrity & Recovery)
Phase: 04 Inventory

## Layer

api

## Package / Area

apps/api/src

## Purpose

Ensure that inventory mutations are fully traceable at the application boundary by recording:
- who attempted the action
- what was attempted (intent)
- what happened (outcome)

This complements DB-level constraints and domain event persistence.

## Implementation Location

* apps/api/src/modules/inventory/*
* apps/api/src/observability/* (if a shared audit logger exists)

## Implementation Notes

* Log entries must capture:
  * tenant_id
  * actor identity
  * action name
  * correlation/request id
  * intent payload (redacted as needed)
  * outcome (success/failure)
* Audit logging must not:
  * leak sensitive info across tenants
  * mutate business state

## Acceptance Criteria

* Every inventory mutation endpoint emits an audit record (intent + outcome)
* Audit record is attributable to an identity
* Failures still emit audit records (with outcome)

## Dependencies

* API-42 — Stock adjustment endpoint
* API-43 — Reservation create/release endpoints
* PRISMA-42 — Define inventory audit / event persistence schema

## Estimated Effort

45–90 minutes
