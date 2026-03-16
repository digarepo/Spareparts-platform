# Task: API-90 — Search controller + context validation (fail-closed)
Blueprint: Domain U (explicit visibility context, fail-closed)
Phase: 09 Search

## Layer

api

## Package / Area

apps/api/src/modules/search

## Purpose

Expose search endpoints that validate visibility context explicitly and fail closed when context is missing or ambiguous.

## Implementation Location

* apps/api/src/modules/search/search.controller.ts
* apps/api/src/modules/search/search.service.ts

## Implementation Notes

* Endpoints:
  * GET /search (context + query)
  * GET /search/products
* Context must be derived from auth + scope, not query params.

## Acceptance Criteria

* Context validation happens before any ES query.
* Missing/invalid context returns an explicit error.

## Dependencies

* CONTRACTS-90..93
* DOMAIN-90..92

## Estimated Effort

60–120 minutes
