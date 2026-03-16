# Task: CONTRACTS-92 — Search query + filter contracts (bounded, non-inferential)
Blueprint: Domain T (scope), Domain U (no context inference)
Phase: 09 Search

## Layer

contracts

## Package / Area

packages/contracts/src/search

## Purpose

Define query and filter contracts that:
- are expressive enough for discovery
- do not allow context inference
- remain bounded to approved indexable entities

## Implementation Location

* packages/contracts/src/search/search-query.contract.ts

## Implementation Notes

* Support:
  * query string
  * category filters
  * attribute filters
  * pagination
  * sort options (bounded)
* Explicitly reject unsafe filters (e.g. cross-tenant facets in tenant scope).

## Acceptance Criteria

* Query schema rejects ambiguous or unsafe combinations.

## Dependencies

* CONTRACTS-91

## Estimated Effort

60–120 minutes
