# Task: API-30 — Auth module and routing surface
Blueprints: Domain A (Repository Architecture), Domain E (Authentication & Trust)
Phase: 03 IAM

## Layer

api

## Package / Area

apps/api/src/http

## Purpose

Create a coherent API surface for authentication endpoints and middleware wiring,
ensuring authentication is identity-only and does not imply authorization.

## Implementation Location

apps/api/src/http/routes/auth/ (or equivalent NestJS module structure)

## Implementation Notes

* Create an Auth module that registers:
  * Controllers for register/login/refresh/logout
  * Middleware/guards for authentication (token verification)
* Ensure:
  * Tenant context introduction remains separate from authentication (Domain E)
  * Authentication middleware attaches identity + session context only
  * Authorization is enforced separately (Domain F)

## Acceptance Criteria

* Auth module exists and is wired into the API application
* Routing structure is clear and does not duplicate responsibilities
* Middleware hooks establish identity context for downstream handlers

## Dependencies

* CONTRACTS-31 — Auth request/response contracts
* DOMAIN-31 — Authentication services and token issuance

## Estimated Effort

60–90 minutes

