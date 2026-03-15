# Task: RLS-30 — Enable RLS on IAM tables
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 03 IAM

## Layer

rls

## Package / Area

packages/db/rls

## Purpose

Enable PostgreSQL Row-Level Security on IAM tables that contain tenant-scoped
data, preparing for strict tenant isolation policies.

## Implementation Location

PostgreSQL schema (migrations or SQL files under `packages/db/rls`)

## Implementation Notes

* Enable RLS on tenant-scoped IAM tables, such as:
  * Account (if tenant-scoped rows exist)
  * AccountRole join table
  * Any tenant-scoped audit/history tables (AuthEvent, Role/Permission history)
* Platform-only lookup tables may not require RLS if they contain no tenant data,
  but any table containing tenantId must be protected.

## Acceptance Criteria

* RLS is enabled for all IAM tables that contain tenant-scoped rows
* Verification confirms RLS is ON for those tables

## Dependencies

* PRISMA-33 — IAM migrations applied (tables exist)

## Estimated Effort

30–60 minutes

