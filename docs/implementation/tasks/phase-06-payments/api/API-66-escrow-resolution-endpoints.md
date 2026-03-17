# Task: API-66 — Escrow resolution endpoints (platform-governed)
Blueprint: Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose platform-governed endpoints to resolve escrow explicitly:
- release to tenant
- return to customer

This makes the escrow system robust and auditable, without granting tenants direct financial control.

## Implementation Location

* apps/api/src/modules/payments/escrow.controller.ts
* apps/api/src/modules/payments/escrow.service.ts

## Implementation Notes

* These endpoints should be restricted to platform staff/service roles.
* Requests must be idempotent.
* Responses must include updated escrow control status.

## Acceptance Criteria

* Endpoints exist (e.g., POST /payments/escrow/:id/release and /return).
* Authority enforced (platform only).
* Input/output validated via contracts.

## Dependencies

* CONTRACTS-67 — Escrow control + release contracts
* DOMAIN-67 — Escrow release/return use cases
* RLS-63 — Platform finance observability policy (and any platform execution policy)

## Estimated Effort

60–120 minutes
