# Task: DOMAIN-91 — Search visibility policy evaluator (fail-closed eligibility)
Blueprint: Domain U (visibility semantics), Domain T (visibility preservation)
Phase: 09 Search

## Layer

domain

## Package / Area

domains/search

## Purpose

Implement a domain-level evaluator that decides eligibility rules for search execution and result inclusion based on explicit visibility context.

## Implementation Location

* domains/search/src/visibility/search-visibility.evaluator.ts

## Implementation Notes

* Must:
  * fail closed on missing/ambiguous context
  * apply most restrictive rule when multiple apply
  * exclude results under uncertainty

## Acceptance Criteria

* Evaluator exists and is used by application services.

## Dependencies

* CONTRACTS-91

## Estimated Effort

60–120 minutes
