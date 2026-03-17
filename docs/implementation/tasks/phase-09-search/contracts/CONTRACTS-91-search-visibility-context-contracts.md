# Task: CONTRACTS-91 — Search visibility context contracts (explicit, validated, fail-closed)
Blueprint: Domain U (Explicit visibility context requirement), Domain B (tenant context introduction)
Phase: 09 Search

## Layer

contracts

## Package / Area

packages/contracts/src/search

## Purpose

Declare the visibility context required to safely execute search.

## Implementation Location

* packages/contracts/src/search/search-visibility.contract.ts

## Implementation Notes

* Context fields must include:
  * scope (customer | tenant | platform)
  * tenant_id when tenant-scoped
  * actor_id
* Context must never be inferred from filters.

## Acceptance Criteria

* Zod schema exists for visibility context.
* API must reject search requests without valid context.

## Dependencies

* Phase 01–03 identity/scope contracts

## Estimated Effort

45–90 minutes
