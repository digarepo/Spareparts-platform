# Blueprint Domain A — Repository & Package Architecture

**(Authoritative Source of Truth)**

---

## 1. Authoritative Monorepo Layout

The repository is a **single monorepo** organized by **package responsibility**, not by technology convenience.

### 1.1 Top-Level Structure (Canonical)

```
/repo-root
│
├─ apps/                # Application packages (runtime entry points)
│
├─ domains/             # Domain packages (business truth)
│
├─ infrastructure/      # Infrastructure implementations
│
├─ contracts/           # Contract packages (explicit boundaries)
│
├─ shared/              # Shared utilities (non-domain, non-business)
│
├─ tooling/             # Repo-level tooling (lint, scripts, CI helpers)
│
├─ docs/                # Architecture & decision documentation
│
└─ package.json         # Workspace root (npm workspaces)
```

This layout is **mandatory**.
No package may exist outside these roots.

---

## 2. Package Categories & Responsibilities

Every package belongs to **exactly one** category below.

Mixing categories inside a single package is **forbidden**.

---

### 2.1 Application Packages (`/apps`)

**Definition**
Runtime executables that wire the system together.

**Responsibilities**

* Process startup & shutdown
* Dependency composition
* Delivery mechanisms (HTTP, UI rendering)
* Configuration and environment binding

**Non-Responsibilities**

* Business rules
* Domain validation
* Infrastructure implementation details

**Rules**

* May depend on: `contracts`, `domains`, `shared`
* Must NOT be depended on by any package
* Must never define contracts

**Examples**

* Backend API
* Admin UI
* Seller UI
* Customer Web App

---

### 2.2 Domain Packages (`/domains`)

**Definition**
The **business truth layer** of the platform.

**Responsibilities**

* Core business rules
* Invariants and policies
* Domain-specific workflows
* Scope-aware logic (platform / tenant / customer)

**Non-Responsibilities**

* HTTP, UI, persistence, queues, caches
* Framework or infrastructure knowledge

**Rules**

* May depend only on:

  * `shared`
  * other domain packages (with justification)
* Must NOT depend on:

  * `apps`
  * `infrastructure`
* **Own and define contracts** related to their domain

Domain packages are the **highest semantic authority** in the system.

---

### 2.3 Infrastructure Packages (`/infrastructure`)

**Definition**
Replaceable technical implementations.

**Responsibilities**

* Databases (Postgres, Redis)
* Search (Elasticsearch)
* Messaging, storage, third-party integrations
* Framework bindings (ORMs, SDKs)

**Non-Responsibilities**

* Business meaning
* Policy decisions
* Domain orchestration

**Rules**

* Implement contracts defined by domains
* May depend on:

  * `contracts`
  * `shared`
* Must NOT define domain concepts
* Must NOT be imported directly by domains

Infrastructure exists to **serve**, never to lead.

---

### 2.4 Contract Packages (`/contracts`) — **Authoritative Boundary**

**Definition**
Stable, explicit interfaces between layers.

**Responsibilities**

* Data shapes
* Interfaces
* Boundary definitions
* Input/output models
* Capability contracts

**Ownership Rule (Critical)**

> Contracts are **owned by the domain they describe**, even though they live in `/contracts`.

**Rules**

* No business logic
* No framework imports
* No infrastructure types
* No application concerns
* Immutable unless versioned intentionally

**Dependency Rules**

* Defined by domains
* Consumed by applications
* Implemented by infrastructure

Contracts are the **only legal crossing point** between layers.

---

### 2.5 Shared Utility Packages (`/shared`)

**Definition**
Generic, boring, cross-cutting helpers.

**Responsibilities**

* Pure utility functions
* Validation primitives
* Formatting helpers
* Constants
* Type helpers

**Non-Responsibilities**

* Business rules
* Domain semantics
* Stateful logic

**Rules**

* Must be stateless
* Must not depend on higher layers
* Must remain generic enough to be deleted without impact

If a shared utility becomes “interesting,” it belongs in a domain.

---

## 3. Dependency Direction Rules (Strict)

Only the following dependency directions are allowed:

```
apps
  ↓
contracts ← domains
  ↑         ↓
infrastructure
  ↓
shared
```

### Allowed

* Application → Domain (via contracts)
* Application → Contracts
* Application → Shared
* Domain → Shared
* Infrastructure → Contracts
* Infrastructure → Shared

### Forbidden (Design Errors)

* Domain → Application
* Domain → Infrastructure
* Shared → any higher layer
* Application → Infrastructure directly
* Any dependency that bypasses contracts

Violations are **architectural faults**, not refactoring candidates.

---

## 4. Contract Ownership & Placement Rules

### 4.1 Where Contracts Live

* Physically: `/contracts/<domain-name>/`
* Conceptually: **owned by the domain**

### 4.2 Who Can Change Contracts

* Only the owning domain
* With explicit impact consideration
* With versioning if breaking

### 4.3 What Contracts May Contain

* Interfaces
* Data schemas
* Domain-level types
* Capability boundaries

### 4.4 What Contracts Must Never Contain

* ORM entities
* HTTP request/response objects
* UI types
* Framework decorators
* Infrastructure-specific fields

Contracts describe **intent**, not implementation.

---

## 5. Scope Separation Enforcement

Package placement must respect **actor scopes**:

* **Platform** logic → platform domains
* **Tenant** logic → tenant domains
* **Customer** logic → customer-facing domains

Cross-scope logic:

* Lives in **platform-level domain packages**
* Is never duplicated
* Is never embedded indirectly

Scope leakage is a **structural violation**.

---

## 6. Enforcement & Stability Rules

This blueprint is:

* **Stable**
* **Enforceable**
* **Higher priority than backlog items**
* **Not overridden by convenience**

Structural changes require:

* Explicit justification
* Impact analysis
* A dedicated backlog issue

---

## 7. Anti-Patterns (Explicitly Disallowed)

* `common/` or `misc/` packages
* Mixed-responsibility packages
* DTOs outside contract packages
* UI importing domain internals
* Infrastructure logic inside domains
* Duplication to avoid dependency clarity

---

## 8. Outcome (Guaranteed)

With this structure:

* Ownership is unambiguous
* Dependency direction is mechanically enforceable
* Type leakage is structurally prevented
* Parallel work is safe
* Future service extraction is realistic

---

## 9. Status

**Status:** Ready for Approval
Once approved, this becomes **non-negotiable architecture**.

---

When you approve this, the **next Blueprint Domain** logically becomes:

**Blueprint Domain B — Backend Module Architecture (NestJS boundary rules)**

Say the word when ready.
