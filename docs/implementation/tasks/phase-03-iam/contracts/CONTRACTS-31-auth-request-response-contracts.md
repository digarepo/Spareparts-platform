# Task: CONTRACTS-31 — Auth request/response contracts (register/login/refresh/logout)
Blueprints: Domain C (Identity & Scope), Domain D (Identity & Account Model), Domain E (Authentication & Trust)
Phase: 03 IAM

## Layer

contracts

## Package / Area

packages/contracts

## Purpose

Define production-grade authentication contracts for register, login, refresh,
and logout flows. Contracts must be explicit about identity, scope, and session
boundaries without leaking authorization semantics into authentication.

## Implementation Location

* packages/contracts/src/iam/auth/auth-requests.schema.ts
* packages/contracts/src/iam/auth/auth-responses.schema.ts

## Implementation Notes

* Use grouped modules (not one file per schema).
* Register:
  * Request includes: email, password, and explicit target scope (tenant staff vs platform staff vs customer)
  * Response includes: identity/account identifiers and session tokens (if issued)
* Login:
  * Request includes: email, password, explicit scope selection if applicable
  * Response returns tokens and identity/account context (without asserting permissions)
* Refresh:
  * Request includes refresh token
  * Response returns rotated tokens (access + refresh) and session context
* Logout:
  * Request includes refresh token or session id
  * Response is confirmation only
* Tokens:
  * Treat as opaque strings in contracts
  * Include expirations as ISO timestamps or seconds where needed
* Documentation:
  * Module-level JSDoc describing auth boundaries
  * JSDoc for each schema/type export with examples

## Acceptance Criteria

* Auth request/response modules exist and export all required schemas and types
* Validation enforces email format, password shape, and required scope fields
* Contracts do not embed role/permission decisions
* JSDoc is consistent and production-grade

## Dependencies

* CONTRACTS-30 — Establish IAM contracts structure

## Estimated Effort

60–90 minutes

