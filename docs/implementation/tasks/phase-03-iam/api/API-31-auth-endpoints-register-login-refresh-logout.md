# Task: API-31 — Auth endpoints (register/login/refresh/logout) with audit events
Blueprints: Domain E (Authentication & Trust), Domain D (Identity Lifecycle), Domain C (Identity & Scope)
Phase: 03 IAM

## Layer

api

## Package / Area

apps/api/src/http/controllers

## Purpose

Implement the core authentication endpoints using contracts validation, domain
authentication services, and append-only audit/event recording.

## Implementation Location

apps/api/src/http/controllers/auth/

## Implementation Notes

* Endpoints:
  * `POST /auth/register`
  * `POST /auth/login`
  * `POST /auth/refresh`
  * `POST /auth/logout`
* Validation:
  * Use CONTRACTS-31 schemas for request/response validation
* Behavior:
  * Authentication establishes identity only (no authorization checks)
  * Identity lifecycle state must be validated (suspended/deactivated/terminated → reject)
  * Refresh must rotate tokens and revoke prior refresh token on use
* Audit:
  * Persist AuthEvent records (PRISMA-32) for:
    * login_success, login_failure
    * refresh
    * logout
    * register
  * Include actor identity, scope, tenant id (if applicable), timestamps

## Acceptance Criteria

* All endpoints are implemented and validate payloads via contracts
* Tokens are issued/rotated correctly and consistently
* AuthEvent audit records are created for key actions
* Failure behavior is non-leaky and deny-by-default

## Dependencies

* API-30 — Auth module and routing surface
* CONTRACTS-31 — Auth request/response contracts
* DOMAIN-31 — Authentication services and token issuance
* PRISMA-32 — IAM lookup and audit/history models

## Estimated Effort

120–180 minutes

