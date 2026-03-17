# Task: API-65 — Payment session endpoint (single customer payment + split creation)
Blueprint: Domain Q (Payment Core Model & Meaning), Domain R (Payment Authority, Control & Escrow Semantics)
Phase: 06 Payments

## Layer

api

## Package / Area

apps/api/src

## Purpose

Expose an endpoint that starts a customer payment session for an order total (pay once), while creating the internal per-tenant split records.

## Implementation Location

* apps/api/src/modules/payments/payment-sessions.controller.ts
* apps/api/src/modules/payments/payment-sessions.service.ts

## Implementation Notes

* Enforce customer scope and ownership of order.
* The endpoint should:
  * validate order is eligible for payment session
  * compute splits
  * create payment session
  * initiate provider interaction (intent/session) via domain use case
* Ensure idempotency (session per order per customer), to prevent multiple sessions for same obligation.

## Acceptance Criteria

* Endpoint exists (e.g., POST /payments/sessions).
* Response includes session id and provider-facing next-step artifact (opaque).
* Internal split is persisted and sum equals total.

## Dependencies

* CONTRACTS-66 — Payment session + splits contracts
* DOMAIN-66 — Payment session splitting + escrow orchestration

## Estimated Effort

90–180 minutes
