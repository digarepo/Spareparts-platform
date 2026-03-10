# Spareparts Platform

Spareparts Platform is a **multi-tenant automotive parts marketplace** designed for **long-term scalability, strict data isolation, and explicit authorization boundaries**.

The platform supports multiple actors:

- **Platform administrators**
- **Merchants (sellers)**
- **Customers**

The system is designed with a strong bias toward:

- **Correctness over velocity**
- **Explicit architectural boundaries**
- **Security and tenant isolation**
- **Long-term maintainability**

This repository is the **authoritative source of architectural truth** for the platform.

All implementation work must conform to the architecture defined in this repository and its supporting documents.

---

# System Architecture Overview

The platform is implemented as a **single Nx monorepo** containing multiple applications and domain packages.

The architecture enforces **clear separation between**:

- runtime applications
- domain logic
- contracts
- infrastructure implementations
- shared utilities

High-level structure:

```text
repo-root
│
├─ apps/
│   ├─ api/                    NestJS backend API
│   ├─ storefront/             Customer ecommerce application
│   ├─ platform-admin/         Platform administration interface
│   └─ merchant-dashboard/     Merchant management dashboard
│
├─ domains/                    Business domain packages
├─ contracts/                  Explicit system boundary contracts
├─ infrastructure/             Technical implementations
├─ shared/                     Generic utilities
│
├─ tooling/                    Repository tooling
├─ docs/                       Architecture & implementation documentation
│
└─ package.json
```

The monorepo is orchestrated using **Nx** to enforce dependency boundaries and enable scalable builds.

---

# Architectural Principles

The following principles are **non-negotiable**.

---

## Contract-First System Boundaries

All system boundaries are defined by **explicit contracts**.

Contracts are:

- defined before implementation
- owned by the domain they describe
- framework-agnostic

Implicit schemas or undocumented data exchange are prohibited.

---

## Explicit Multi-Tenancy

Tenant context is always explicit.

No component may assume:

- a default tenant
- a default role
- a default scope

Tenant isolation is enforced at:

- application level
- database level
- authorization layer

---

## Defense-in-Depth Authorization

Authorization is enforced redundantly.

### Application Layer

Explicit permission checks inside services.

### Database Layer

PostgreSQL **Row-Level Security (RLS)** enforces:

- tenant isolation
- visibility rules
- ownership guarantees

Application checks alone are considered insufficient.

---

## Database as an Enforcement Boundary

PostgreSQL is treated as an **active enforcement layer**, responsible for:

- tenant isolation
- data visibility
- ownership validation

The database is not a passive datastore.

---

## Domain Independence from Frameworks

Frameworks are treated as **infrastructure**.

Domain logic must remain independent from:

- NestJS
- React
- Prisma
- UI frameworks

Domain packages must remain **portable and testable**.

---

## Derived Systems Are Non-Authoritative

Systems such as search or caches are **derived views**.

Examples:

- Elasticsearch indexes
- Redis caches

These systems must **never become sources of truth**.

---

# Domain Architecture Map

The system architecture is organized into **domain capabilities**.

Each domain is defined through an **architecture blueprint**.

```
Domain Architecture
├─ Foundation Domains
│  ├─ A  Repository Architecture
│  ├─ B  Data & Environment
│  └─ C  Identity Scope & Authorization
│
├─ Identity & Access
│  ├─ D  Identity Account Model
│  ├─ E  Authentication Trust
│  └─ F  Authorization Roles & Scope
│
├─ Catalog
│  ├─ G  Product Catalog Core
│  ├─ H  Catalog Visibility & Publication
│  └─ I  Taxonomy & Classification
│
├─ Pricing & Assets
│  └─ J  Pricing Assets Governance
│
├─ Inventory
│  ├─ K  Inventory Core Model
│  ├─ L  Inventory Availability & Reservation
│  └─ M  Inventory Governance
│
├─ Commerce Flow
│  ├─ N  Cart & Order Intent
│  ├─ O  Order Lines & Pricing Snapshots
│  └─ P  Order Transitions Governance
│
├─ Payments
│  ├─ Q  Payment Core Model
│  ├─ R  Payment Authority & Escrow
│  └─ S  Payment Failure Handling
│
├─ Search
│  ├─ T  Search Purpose & Scope
│  ├─ U  Search Indexing Isolation
│  └─ V  Search Relevance Governance
│
├─ Administrative Interfaces
│  ├─ W  Admin UI Authority
│  ├─ X  Admin Visibility & Actions
│  └─ Y  Admin Auditability
│
├─ Seller Interfaces
│  ├─ Z   Seller UI Authority
│  ├─ AA  Seller Visibility Boundaries
│  └─ AB  Seller Auditability
│
├─ Security & Operations
│  ├─ AC  Security Hardening
│  ├─ AD  Data Integrity & Recovery
│  └─ AE  Observability & Operations
│
├─ Release Governance
│  ├─ AF  Release Readiness
│  ├─ AG  Migration & Cutover
│  └─ AH  Post-Release Incident Handling
│
├─ Fulfillment & Logistics
│  ├─ AI  Fulfillment Core
│  ├─ AJ  Shipment & Logistics
│  └─ AK  Delivery Tracking
│
└─ Customer Lifecycle
   ├─ AL  Returns & Refunds
   └─ AM  Customer Notification Governance
   ```

Each domain has a **dedicated architecture blueprint** in the repository.

---

# Architecture Blueprints

Architecture is defined through **Blueprint Domains**.

Location:

```
docs/architecture/
```

Structure:

```
docs/architecture
├── overview.md
├── contracts.md
├── data.md
├── development.md
├── environment.md
├── security.md
│
└── blueprints/
```

Blueprint files describe:

- domain scope
- structural constraints
- data ownership
- dependency rules
- operational boundaries

Example blueprint:

```
docs/architecture/blueprints/70-domain-g-product-catalog-core.md
```

Blueprints are considered **stable architecture** and must not be modified casually.

---

# Implementation Task System

Implementation work is defined through **task specifications** derived from architecture blueprints.

Location:

```
docs/implementation/tasks/
```

Tasks represent **atomic units of implementation work**.

Example structure:

```
docs/implementation/tasks/
└── phase-08-1-platform-admin-ui
├── infrastructure/
├── layout/
├── navigation/
├── tenants/
├── policies/
├── search/
├── payments/
├── observability/
├── audit/
└── staff/
```

Each task defines:

- blueprint reference
- implementation layer
- package location
- acceptance criteria
- dependencies

Example:

Task: CONTRACTS-001 — Create catalog contracts directory
Blueprint: Domain G (Product Catalog Core)

Layer
contracts

Implementation Location
```
packages/contracts/src/catalog/
```

Acceptance Criteria
• packages/contracts/src/catalog exists
• directory committed

Implementation tasks ensure that architecture is **executed systematically and traceably**.

---

# Frontend Architecture

The platform includes multiple web applications designed for different system actors. Each application shares a common UI foundation while maintaining clear responsibility boundaries.

## Frontend Applications

The following frontend applications exist within the `apps/` workspace:

- **storefront**
  Customer-facing ecommerce interface used for product discovery, browsing spare parts, managing carts, and placing orders.

- **platform-admin**
  Internal administrative interface used by platform operators for governance, tenant management, auditing, and operational oversight.

- **merchant-dashboard**
  Seller-facing interface used by merchants to manage product catalogs, inventory levels, pricing, and order fulfillment.

## UI Technology Stack

Frontend applications are built using a modern React-based stack focused on performance, maintainability, and design consistency.

Core technologies include:

- **React** with **React Router** for client-side navigation
- **TypeScript** for type-safe UI logic
- **Tailwind CSS v4** for utility-first styling
- **shadcn/ui** component primitives for consistent UI composition
- **Nx** workspace tooling for dependency boundaries and shared libraries

## Design System Approach

User interfaces are built on a shared design foundation that prioritizes:

- composable UI primitives
- predictable styling conventions
- accessibility and responsiveness
- high performance under large product catalogs

Tailwind CSS and shadcn/ui together provide a lightweight design system that allows consistent UI construction across all frontend applications.

## UI Responsibility Boundaries

Frontend applications are responsible for:

- presentation and layout
- user interaction
- client-side state
- request orchestration

Frontend code **must not contain business rules or authorization logic**.
All authoritative validation and policy enforcement occur within the backend domain layer.

---

# Development Workflow

## Requirements

- Node.js **20+**
- npm
- Docker (for infrastructure services)

---

## Install Dependencies

```
npm install
```

---

## Nx Tooling

Run workspace commands:

```
npx nx lint
npx nx typecheck
```

View dependency graph:

```
npx nx graph
```

Run applications:

```
npx nx serve api
npx nx serve storefront
```

---

# Contributor Rules

The following rules apply to all contributors.

### Forbidden

- Cross-package deep imports
- Domain logic inside UI or controllers
- Authorization decisions in frontend code
- Implicit tenant assumptions
- Bypassing database RLS

### Required

- Use explicit contracts
- Maintain domain boundaries
- Keep domain logic framework-independent
- Follow implementation tasks

Violations are considered **architectural defects**.

---

# Documentation Map

| Document | Purpose |
|--------|--------|
| docs/architecture/overview.md | Architecture overview |
| docs/architecture/blueprints/ | Domain architecture definitions |
| docs/architecture/contracts.md | Contract governance |
| docs/architecture/security.md | Security architecture |
| docs/implementation/tasks/ | Implementation specifications |

---

# Current Status

The repository currently contains:

- architecture blueprints
- repository governance rules
- structured implementation task phases

Feature implementation proceeds **strictly through defined tasks**.

---

# Governance

This document is **authoritative**.

Changes must align with the architecture principles defined in this repository.
