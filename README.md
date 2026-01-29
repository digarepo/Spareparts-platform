# Spareparts Platform

## Overview

Spareparts Platform is a multi-tenant marketplace system designed for long-term scalability, strict data isolation, and explicit authorization boundaries. The platform is architected to support multiple tenant roles (platform administrators, sellers, and customers) while enforcing separation of concerns across domain, application, and infrastructure layers.

This repository is the authoritative source of architectural truth for the platform. All implementation work is expected to conform to the constraints and principles documented here and in the accompanying architecture and backlog documents.

The system prioritizes correctness, maintainability, and operational safety over short-term development velocity.

---

## Architectural Principles

The following principles are non-negotiable and apply to all code written in this repository:

### Contract-First Design

All system boundaries are defined by explicit contracts. Shared contracts are authoritative and must be defined before implementation. No implicit data sharing or inferred schemas are permitted.

### Explicit Multi-Tenancy

Tenant context is always explicit. No code may assume a default tenant, role, or scope. Tenant isolation is enforced at multiple layers, including the database.

### Defense-in-Depth Authorization

Authorization is enforced redundantly:

* At the application layer through explicit checks
* At the database layer through Row-Level Security (RLS)

Bypassing database-level enforcement is prohibited.

### Database as an Enforcement Boundary

PostgreSQL is not a passive datastore. It is an active enforcement layer responsible for:

* Tenant isolation
* Visibility constraints
* Data ownership guarantees

Application logic must never rely solely on in-memory or request-level checks for access control.

### Frameworks as Infrastructure, Not Domain Owners

Frameworks are treated as delivery mechanisms only. Business rules and domain logic must not depend on framework-specific abstractions. Domain logic must remain portable and testable in isolation.

### Derived Systems Are Non-Authoritative

Search indexes and other projections are derived views of authoritative data. They must never be treated as sources of truth and must not introduce new business rules.

---

## Repository Structure

This repository is organized as a monorepo to provide strong boundaries while enabling shared tooling and contracts.

High-level structure:

* `apps/`
  Runtime applications (API, Web). These contain transport, composition, and delivery logic.

* `packages/`
  Shared, versioned building blocks such as contracts and database access layers.

The separation between applications and packages is intentional. Shared logic must live in packages. Applications must not contain reusable domain primitives.

The monorepo structure is a deliberate architectural choice, not a transitional phase.

---

## Technology Stack

The platform uses a conservative, production-oriented technology stack selected for long-term maintainability and explicit behavior.

A detailed and version-locked description of the stack is maintained in:

* `TECH_STACK.md`

This README references the stack but does not redefine it. Any change to the technology stack must be reflected in the authoritative document.

---

## Development Workflow

### Requirements

* Node.js 20 or newer
* npm (workspace-aware)

### Installation

```bash
npm install
```

### Tooling Checks

```bash
npm run lint
npm run typecheck
```

These commands are expected to pass in a clean working tree. During early bootstrap phases, empty workspaces are allowed and handled explicitly by configuration.

---

## Rules for Contributors

The following rules apply to all contributors, including maintainers:

* No cross-package deep imports. Public entry points must be used.
* No implicit tenant or role assumptions.
* No domain logic inside controllers, UI components, or infrastructure adapters.
* No authorization decisions in the frontend.
* No bypassing or weakening of database Row-Level Security.
* Contracts are authoritative; implementations must conform to them, not redefine them.

Violations of these rules are considered architectural defects.

---

## Documentation Map

This repository relies on multiple authoritative documents:

* `TECH_STACK.md`
  Locked technology decisions and rationale.

* `REPO_STRUCTURE.md`
  Authoritative repository and folder structure.

* Sprint backlog documents
  Define expected behavior, constraints, and acceptance criteria per domain and sprint.

Future documentation will live under dedicated documentation directories and must remain consistent with the architecture defined here.

---

## Status

At this stage, the repository establishes architectural foundations, tooling, and enforcement rules. Feature implementation begins only after these foundations are in place and verified.

---

This document is authoritative. Changes require deliberate review and alignment with the overall architecture of the platform.
