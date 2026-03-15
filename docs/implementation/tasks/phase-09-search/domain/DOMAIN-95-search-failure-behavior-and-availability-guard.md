# Task: DOMAIN-95 — Search failure behavior + availability guard
Blueprint: Domain T (search failure must not block operations), Domain U (fail-closed safety rule), Domain V (safe degradation)
Phase: 09 Search

## Layer

domain

## Package / Area

domains/search

## Purpose

Implement a search availability guard that ensures:
- search failures degrade discovery only
- search never becomes a hidden dependency for correctness
- unsafe contexts fail closed

## Implementation Location

* domains/search/src/availability/search-availability.guard.ts

## Implementation Notes

* If ES is unavailable:
  * customer discovery endpoints may return 503 (search only)
  * core operations (orders/payments/fulfillment) must be unaffected
* If context cannot be validated: fail closed.

## Acceptance Criteria

* Guard exists and is used by API.

## Dependencies

* ES-90
* CONTRACTS-91

## Estimated Effort

60–120 minutes
