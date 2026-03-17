# Task: SEC-80 — Rate limiting policy + fail-closed semantics
Blueprint: Domain AC (Rate limiting semantics), TECH_STACK (rate limiting), Domain AE (non-interference)
Phase: 08 Infrastructure & Runtime

## Layer

security

## Package / Area

apps/api/src/http

## Purpose

Define and implement rate limiting as a protective control that reduces surface area under abuse without changing domain outcomes.

## Implementation Location

* apps/api/src/http/middleware/rate-limit.middleware.ts
* packages/infra/redis/src/ratelimit/rate-limit.service.ts

## Implementation Notes

* Rate limiting must be:
  * deny-by-default when triggered
  * explicit (HTTP 429)
  * scoped by actor type + tenant + route class
* Must not create partial execution.

## Acceptance Criteria

* Rate limiting exists and is testable.
* Controls cannot be bypassed via alternate endpoints.

## Dependencies

* REDIS-81

## Estimated Effort

90–180 minutes
