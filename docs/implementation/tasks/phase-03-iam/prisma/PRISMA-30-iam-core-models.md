# Task: PRISMA-30 — IAM core models (Identity, Account, Credentials, Session)
Blueprints: Domain D (Identity & Account Model), Domain E (Authentication & Trust), Domain C (Identity & Scope)
Phase: 03 IAM

## Layer

prisma

## Package / Area

packages/db/prisma/schema.prisma

## Purpose

Model IAM primitives in the database with explicit separation of Identity and Account,
supporting scope-first execution, tenant isolation, and production-grade session handling.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Identity vs Account (hard separation):
  * `Identity` — globally unique principal (who)
  * `Account` — scope-bound participation container (where/how)
* Suggested models (names may vary):
  * `Identity`:
    * `id` (ULID/UUID)
    * `email` (unique where appropriate)
    * `lifecycleStatusCode` (string FK to `IdentityStatus.code`)
    * timestamps
  * `Account`:
    * `id`
    * `identityId` FK
    * `scopeCode` (string FK to `Scope.code`)
    * `tenantId` nullable (required for tenant scope; forbidden for platform scope)
    * `accountStatusCode` (string FK to `AccountStatus.code`)
    * timestamps
  * `PasswordCredential` (or `CredentialPassword`):
    * `identityId` FK
    * `passwordHash`
    * algorithm metadata if needed
  * `Session`:
    * `id`
    * `identityId`, `accountId`, `scopeCode`, `tenantId`
    * `createdAt`, `expiresAt`, `revokedAt` (nullable)
    * `revokedReasonCode` (optional)
* Avoid DB enums; use lookup tables for status and scope codes with FK constraints.

## Acceptance Criteria

* `Identity` and `Account` models exist and reflect blueprint separation
* Credentials and session models exist for password auth and refresh flows
* Status/scope codes are string-based and governed via lookup tables + FKs
* Prisma validate passes

## Dependencies

* DB-01/DB-02 (Phase 01) — Base Prisma setup and Tenant model exists

## Estimated Effort

120–180 minutes

