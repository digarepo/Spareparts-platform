# Spareparts Platform — Locked Technology Stack (Authoritative)

This document defines the **final, authoritative technology stack** for the Spareparts multi-tenant marketplace platform.

All technologies listed here are **explicitly chosen**, **non-optional**, and **binding** unless this document is formally revised through an architectural decision process.

Nothing in this stack is implicit.

---

## 1. Architectural Principles

- API-first system
- Multi-tenant by construction
- Database-enforced isolation
- Explicit authority and scope
- Contract-driven development
- Conservative, long-term maintainability
- No hidden execution paths
- No framework-owned business logic

---

## 2. Runtime & Language

### Node.js

- **Version:** Latest LTS (≥ 20.x)
- **Usage:** Backend runtime, tooling, scripts

Node.js is the unified runtime across backend and tooling for operational simplicity and ecosystem maturity.

---

### TypeScript

- **Version:** Latest stable
- **Usage:** All application code

TypeScript is mandatory for:

- Domain correctness
- Contract safety
- Long-term maintainability
- Team scalability

JavaScript-only source files are not permitted in application code.

---

## 3. Backend Platform

### Framework: NestJS

- **Version:** Latest stable
- **Role:** Application shell only

NestJS is used for:

- HTTP transport
- Dependency injection
- Guards and middleware
- Application lifecycle management

NestJS **does not own**:

- Domain logic
- Authorization semantics
- Business rules

All domain logic must remain framework-agnostic.

---

### API Style

- **Protocol:** REST (JSON over HTTP)
- **Contract:** OpenAPI

The API is the **primary system of record**.

All clients (web, mobile, admin tools) consume the same API.

---

### API Contracts

- **Schema Language:** Zod
- **Authority:** Zod schemas are authoritative
- **OpenAPI:** Generated artifact only

OpenAPI documentation is generated from Zod-backed contracts.
OpenAPI must never be edited manually.

If OpenAPI and Zod diverge, OpenAPI is invalid.

---

## 4. Database & Data Enforcement

### Database

- **PostgreSQL**
- **Version:** Latest stable

PostgreSQL is the authoritative transactional datastore.

---

### ORM

- **Prisma**
- **Version:** Latest stable

Prisma is responsible for:

- Schema definition
- Migrations
- Type-safe database access

Prisma is a persistence layer only.
It does not enforce domain or tenant semantics.

---

### Multi-Tenancy & Isolation

- Tenant isolation is **mandatory**
- Isolation is enforced at the **database layer**
- Application logic alone is insufficient

#### Row-Level Security (RLS)

- **Always enabled**
- Enabled in all environments (dev, test, prod)
- Never bypassed

Tenant context is injected via database session variables:

- `app.tenant_id`
- `app.scope`

RLS policies reference session context and are authoritative.

---

### Database Access Model

- No global Prisma client
- Request-scoped database execution
- Tenant and scope must be validated before DB access
- All queries execute inside a session-bound transaction

---

## 5. Identity & Access Management (IAM)

### Core Entities

- Users (global identities)
- Tenants (platform and organizations)
- Memberships (user ↔ tenant)
- Roles (data-driven, not enums)
- Permissions (explicit capability keys)
- Role–permission mappings
- Audit logs

---

### Authorization Model

- Permission-based authorization
- Roles are collections of permissions
- Authorization is deny-by-default
- Scope is explicit and immutable per execution

Authorization is enforced at:

- API boundaries
- Domain boundaries
- Data access boundaries

---

## 6. Frontend

### Architecture

- API-first Single Page Application (SPA)
- Frontend is a **consumer**, not an authority
- No backend logic duplication

---

### UI Framework

- **React**
- **Version:** Latest stable

React is used as a rendering library only.

---

### Routing

- Client-side routing
- React Router (UI routing only)

Routing must not:

- Introduce backend authority
- Proxy backend logic
- Infer identity or scope

---

### Data & Forms

Allowed:

- Native HTML forms
- Explicit API calls
- TanStack Query
- TanStack Form
- shadcn/ui patterns

Forbidden:

- Framework-managed backend logic
- Implicit loaders/actions acting as APIs

Libraries may reduce boilerplate but must not own authority.

---

### Styling

- Tailwind CSS (latest stable)
- Utility-first styling

---

## 7. Search

### Search Engine

- **Elasticsearch**
- **Version:** 8.x (latest stable)

Elasticsearch is **mandatory**, not optional.

---

### Search Model

- Search is **derived**, not authoritative
- Data is projected from PostgreSQL
- Tenant isolation is enforced in indexing and querying
- Failure of search must not affect transactional correctness

Elasticsearch is used for:

- Catalog search
- Filtering
- Relevance ranking

---

## 8. Caching & Coordination

### Redis

- **Version:** Latest stable

Redis is a required infrastructure component.

Used for:

- Idempotency keys
- Short-lived reservations
- Rate limiting
- Coordination without DB contention

Redis is not a source of truth.

---

## 9. Object Storage

### Storage

- **S3-compatible object storage**

Usage:

- Product images
- Media assets
- Documents and exports

Local/dev:

- MinIO

Production:

- Any S3-compatible provider

Storage access is abstracted behind the API.

---

## 10. Payments & External Integrations

### Payments (Ethiopia)

- **Telebirr**
- **EthSwitch**

---

### Payment Model

- Escrow-based flows
- Idempotent operations
- Explicit provider abstraction
- Secure webhooks and callbacks

No provider-specific logic leaks into domain semantics.

---

## 11. Infrastructure & Deployment

### Containerization

- Docker
- Docker Compose (development)

---

### Deployment Model

- Container-based deployment
- Single cloud provider initially
- No Kubernetes in early phases

Infrastructure complexity is introduced only when justified.

---

## 12. Observability & Operations

### Logging

- Structured logging
- Mandatory fields:
  - request_id
  - tenant_id
  - scope
  - actor_id

---

### Auditing

- Mandatory audit logs for sensitive actions
- Immutable audit records
- Queryable by tenant and time

---

### Metrics

- Minimal baseline metrics
- Hooks must exist
- Metrics must not influence authorization or behavior

---

## 13. Tooling & Quality Gates

### Code Quality

- ESLint (type-aware)
- Prettier
- Strict TypeScript configuration

---

### CI/CD

- GitHub Actions
- Required checks:
  - Lint
  - Typecheck
  - Build

Protected branches enforce green CI.

---

## 14. Explicit Non-Choices

The following are **explicitly excluded**:

- Next.js
- Server-side rendering frameworks
- GraphQL
- tRPC
- Framework-owned backend logic
- ORM-enforced multi-tenancy
- Disabling RLS in any environment
- Kubernetes (initially)
- Serverless-first architecture

---

## 15. Change Policy

Any change to this stack requires:

- Documentation update
- Architectural justification
- Impact analysis

Silent drift is forbidden.

---

**Status:** Locked
**Authority:** Architectural Source of Truth
