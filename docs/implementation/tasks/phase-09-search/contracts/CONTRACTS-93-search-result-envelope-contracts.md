# Task: CONTRACTS-93 — Search result envelope contracts (staleness + explainability)
Blueprint: Domain T (derived projection), Domain U (freshness semantics), Domain V (explainability)
Phase: 09 Search

## Layer

contracts

## Package / Area

packages/contracts/src/search

## Purpose

Define search response envelopes that capture:
- results
- pagination
- freshness/staleness metadata
- explainability hints (conceptual, not provider-internal)

## Implementation Location

* packages/contracts/src/search/search-results.contract.ts

## Implementation Notes

* Include fields such as:
  * `as_of` (best-effort)
  * `consistency` = eventual
  * `warnings` (e.g. degraded search)

## Acceptance Criteria

* Response contracts include explicit staleness semantics.

## Dependencies

* CONTRACTS-92

## Estimated Effort

45–90 minutes
