# Task: DB-01 — Initialize Prisma schema and datasource
Blueprint: Domain B (Data & Environment Enforcement)
Phase: 01 Foundations

## Layer

database

## Package / Area

packages/db/prisma

## Purpose

Establish the base Prisma schema for the project, including datasource and generator
configuration, so future models can be added in a single authoritative location.

## Implementation Location

packages/db/prisma/schema.prisma

## Implementation Notes

* Create or update `schema.prisma` to define:
  * A `datasource` for PostgreSQL aligned with environment configuration
  * A `generator` for the Prisma client
* Configuration must:
  * Not embed environment-specific values (use env vars)
  * Be suitable for local development and future environments
* Do not define application models in this task beyond what is necessary
  for a valid schema file.

## Acceptance Criteria

* `packages/db/prisma/schema.prisma` exists
* A PostgreSQL datasource is defined and uses environment variables
* A Prisma client generator is defined
* `prisma validate` succeeds for the base schema

## Dependencies

None

## Estimated Effort

10–20 minutes

