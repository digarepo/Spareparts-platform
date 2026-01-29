````markdown
# Spareparts Platform — Repository Structure (Authoritative)

This document defines the **authoritative repository folder and file structure** for the Spareparts multi-tenant marketplace platform.

This structure is designed to:

- Enforce architectural boundaries
- Prevent framework leakage into business logic
- Support long-term scalability and team growth
- Make future microservice extraction mechanical
- Keep infrastructure replaceable
- Avoid structural drift over time

All directories, naming, and ownership rules defined here are **binding** unless this document is formally revised.

---

## 1. High-Level Structure

```text
.
├── apps/                  # Runtime entry points (thin shells)
├── domains/               # Business logic (framework-agnostic)
├── packages/              # Shared technical packages
├── infra/                 # Infrastructure & external integrations
├── docs/                  # Architecture & operational documentation
├── tools/                 # Automation and one-off scripts
├── docker/                # Local and development infrastructure
├── package.json
├── tsconfig.base.json
└── README.md
```
````

---

## 2. Directory Responsibilities

### `apps/`

Runtime entry points only.

Rules:

- No business logic
- No domain rules
- No persistence rules
- May depend on domains, packages, and infra
- Never depended on by domains

---

### `domains/`

Authoritative business logic.

Rules:

- Framework-agnostic
- No NestJS imports
- No Prisma imports
- No HTTP concerns
- No infrastructure concerns
- Pure TypeScript

---

### `packages/`

Shared technical building blocks.

Rules:

- Explicit ownership
- Clear single responsibility
- Reusable across apps and infra
- No application orchestration logic

---

### `infra/`

Replaceable infrastructure and integrations.

Rules:

- External systems
- Side effects
- IO boundaries
- No business rules
- No domain decisions

---

### `docs/`

Architectural and operational authority.

Rules:

- Markdown only
- Source of truth for decisions
- No generated files

---

### `tools/`

Developer tooling and automation.

Rules:

- One-off or batch scripts
- No runtime dependencies
- No business logic

---

### `docker/`

Local and development infrastructure.

Rules:

- Dockerfiles
- Compose files
- Volume definitions
- No application logic

---

## 3. Backend Application (NestJS)

```text
apps/api/
├── src/
│   ├── main.ts                 # Application bootstrap
│   ├── app.module.ts           # Root module wiring
│   ├── http/
│   │   ├── controllers/        # HTTP transport only
│   │   ├── guards/             # Auth & scope enforcement
│   │   ├── decorators/         # Request metadata
│   │   └── middleware/         # Request lifecycle hooks
│   ├── wiring/                 # Domain ↔ infrastructure wiring
│   │   ├── auth.wiring.ts
│   │   ├── catalog.wiring.ts
│   │   ├── inventory.wiring.ts
│   │   └── checkout.wiring.ts
│   └── health/                 # Health and readiness endpoints
├── test/
├── package.json
└── tsconfig.json
```

Rules:

- Controllers call domain services
- Wiring binds domain interfaces to infra implementations
- No domain logic inside controllers or guards
- No persistence logic inside app layer

---

## 4. Frontend Application (SPA)

```text
apps/web/
├── src/
│   ├── app/                    # App bootstrap and layout
│   ├── routes/                 # Client-side routes
│   ├── components/             # UI components
│   ├── forms/                  # Form abstractions
│   ├── queries/                # Data fetching logic
│   └── lib/                    # Client-side helpers
├── public/
├── package.json
└── vite.config.ts
```

Rules:

- API-first SPA
- No backend logic duplication
- No server-side authority
- Build output is never committed

---

## 5. Domains (Business Logic)

```text
domains/
├── auth/
│   ├── entities.ts
│   ├── services.ts
│   ├── policies.ts
│   └── errors.ts
├── iam/
├── catalog/
├── inventory/
├── checkout/
├── payments/
└── search/
```

Rules:

- Business language only
- Stateless where possible
- Explicit inputs and outputs
- No framework or infrastructure imports

---

## 6. Contracts

```text
packages/contracts/
├── src/
│   ├── auth/
│   ├── iam/
│   ├── catalog/
│   ├── inventory/
│   ├── checkout/
│   └── payments/
├── index.ts
├── package.json
└── tsconfig.json
```

Rules:

- Zod schemas are authoritative
- Defines data shape only
- No behavior
- Used by backend, frontend, and future mobile clients

---

## 7. Database & RLS (Prisma)

```text
packages/db/
├── prisma/
│   └── schema.prisma           # Database schema authority
├── migrations/                 # Generated migrations
├── rls/
│   ├── policies.sql            # RLS policies
│   └── helpers.sql             # Session helpers
├── src/
│   ├── client.ts               # Request-scoped Prisma client
│   ├── session.ts              # Tenant & scope injection
│   └── seed/
├── package.json
└── tsconfig.json
```

Rules:

- RLS always enabled
- No global DB clients
- Session-bound execution only
- Database enforces tenant isolation

---

## 8. Infrastructure & Integrations

```text
infra/
├── search/
│   ├── index-mappings/
│   ├── projections/
│   ├── indexer.ts
│   └── search-client.ts
├── redis/
│   └── redis-client.ts
├── storage/
│   └── object-storage.ts
├── payments/
│   ├── telebirr/
│   └── ethswitch/
└── observability/
    ├── logger.ts
    └── tracing.ts
```

Rules:

- Infra contains IO and side effects
- No business rules
- All infra accessed via interfaces

---

## 9. Documentation

```text
docs/
├── architecture/
│   ├── TECH_STACK.md
│   ├── REPO_STRUCTURE.md
│   └── blueprints/
├── implementation/
├── operations/
└── decisions/
```

Rules:

- Architecture is authoritative
- Decisions are explicit
- No undocumented deviations

---

## 10. Tooling

```text
tools/
├── backlog/
└── scripts/
```

Rules:

- No runtime dependencies
- No domain logic
- Safe to delete or rewrite

---

## 11. Build Output Policy

- `dist/`, `build/`, and generated artifacts are ignored
- Humans never read build output
- Build artifacts are disposable

---

## 12. Change Policy

Any change to this structure requires:

- Documentation update
- Architectural justification
- Impact analysis

Silent structural drift is forbidden.

---

**Status:** Locked
**Authority:** Architectural Source of Truth

```
::contentReference[oaicite:0]{index=0}
```
