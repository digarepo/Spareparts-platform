# Task: DOMAIN-90 — Search query value objects + validation
Blueprint: Domain T (bounded scope), Domain U (explicit context)
Phase: 09 Search

## Layer

domain

## Package / Area

domains/search

## Purpose

Implement search query value objects that:
- normalize query intent
- validate bounds
- prevent implicit context inference

## Implementation Location

* domains/search/src/query/search-query.vo.ts
* domains/search/src/query/search-filters.vo.ts

## Implementation Notes

* Ensure:
  * bounded pagination
  * safe filter combinations
  * explicit visibility context is always required

## Acceptance Criteria

* Value objects exist and reject invalid/unsafe inputs.

## Dependencies

* CONTRACTS-91/92

## Estimated Effort

60–120 minutes
