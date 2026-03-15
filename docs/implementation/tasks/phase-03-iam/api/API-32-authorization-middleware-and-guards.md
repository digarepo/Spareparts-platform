# Task: API-32 — Authorization middleware and guards (scope-first)
Blueprints: Domain F (Authorization, Roles, Scope), Domain C (Identity & Scope)
Phase: 03 IAM

## Layer

api

## Package / Area

apps/api/src/http/middleware

## Purpose

Implement API-level authorization enforcement that requires explicit identity and
active scope, delegates decisions to the domain authorization engine, and records
auditable decisions at trust boundaries.

## Implementation Location

apps/api/src/http/middleware/ and/or apps/api/src/http/guards/

## Implementation Notes

* Authentication vs Authorization:
  * Authentication middleware establishes identity/session context only
  * Authorization guard enforces allow/deny decisions for protected actions
* Scope-first requirements:
  * Reject requests missing active scope
  * Ensure tenant id is explicit for tenant-scoped actions
* Decision engine:
  * Call domain authorization function (DOMAIN-32) with explicit inputs
* Audit:
  * Persist authorization decisions (allow/deny + reason codes) to an audit table
    if you choose to store them in DB (recommended for high-risk actions)

## Acceptance Criteria

* Authorization guard/middleware exists and blocks unauthorized access
* Missing scope or tenant context results in denial (fail-closed)
* Decisions are explainable and observable (logs and/or DB audit)
* No business logic is embedded in guards; they delegate to domain decisions

## Dependencies

* DOMAIN-32 — Authorization decision engine
* CONTRACTS-32 — Authorization and RBAC contracts
* API-30 — Auth module and routing surface

## Estimated Effort

90–150 minutes

