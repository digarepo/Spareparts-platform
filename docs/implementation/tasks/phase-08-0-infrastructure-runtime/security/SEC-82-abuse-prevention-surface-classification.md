# Task: SEC-82 — Abuse-prevention surface classification (public vs internal)
Blueprint: Domain AC (abuse prevention, non-semantic enforcement)
Phase: 08 Infrastructure & Runtime

## Layer

security

## Package / Area

apps/api/src/http

## Purpose

Classify API surfaces so protective controls can be applied consistently and cannot be bypassed.

## Implementation Location

* docs/architecture/api-surface-classification.md

## Implementation Notes

* Define route groups:
  * public unauthenticated
  * customer authenticated
  * tenant authenticated
  * platform staff
* Map each group to baseline rate limits and throttles.

## Acceptance Criteria

* Classification document exists and is used by rate limiting middleware.

## Dependencies

* SEC-80

## Estimated Effort

30–60 minutes
