# Blueprint Domain F — Authorization, Roles, and Active Scope

**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **non-negotiable authorization model** governing:

* Permission evaluation
* Role ownership and lifecycle
* Scope establishment and switching
* The conceptual relationship between sessions and scope

Its purpose is to ensure that **access decisions are explicit, deterministic, auditable, and structurally enforced**.

This blueprint is **authoritative**.
All IAM behavior in Sprint 2 and beyond must conform to it.

Violations are **design failures**, not bugs.

---

## 2. Core Invariants (System-Wide)

The following invariants apply without exception:

1. **Authorization is scope-first**
2. **Roles are scoped and owned**
3. **Permissions are explicit and finite**
4. **Default access is deny**
5. **Sessions carry context, not authority**
6. **Scope switching is explicit and observable**

If any invariant cannot be proven at runtime, the operation must fail.

---

## 3. Authorization Model (Authoritative)

### 3.1 What Authorization Is

Authorization determines whether a **specific action on a specific resource** is permitted:

* For a given **authenticated identity**
* Within a single **active scope**

Authorization answers only:

> “Is this action allowed in this scope?”

Authorization does **not**:

* Authenticate identity
* Establish scope
* Execute business logic
* Mutate state

---

### 3.2 Authorization Purity Rule

Authorization is a **pure decision function**.

It must:

* Have no side effects
* Not read or write mutable system state
* Not trigger execution paths
* Not depend on prior authorization outcomes

Authorization produces a decision — **allow or deny** — and nothing else.

---

## 4. Inputs to Authorization (Mandatory)

Every authorization decision requires **all** of the following inputs:

1. **Authenticated Identity**
2. **Active Scope** (platform | tenant | customer)
3. **Requested Action**
4. **Target Resource**

Rules:

* Inputs must be explicit
* Inputs must be validated
* Missing or ambiguous input results in denial

There is no fallback or inference.

---

## 5. Scope-First Evaluation Rule (Non-Negotiable)

Authorization is evaluated **within exactly one active scope**.

Rules:

* Scope must be established *before* authorization
* Authorization never spans scopes
* Permissions have meaning only within their scope

A permission valid in one scope is **invalid everywhere else**.

If scope cannot be determined with certainty, authorization fails.

---

## 6. Role Model (Authoritative)

### 6.1 Role Definition

A **Role** is a named collection of permissions **within a specific scope**.

Properties:

* Roles do not exist globally
* Roles are meaningless without scope
* Roles describe *capability*, not *identity*

Roles never grant authority outside their owning scope.

---

### 6.2 Role Ownership Rule

Every role is owned by exactly one scope:

* **Platform roles** → owned by the Platform Owner Organization
* **Tenant roles** → owned by the Tenant Company
* **Customer roles** → system-defined only

Ownership defines **who may define, assign, modify, or revoke the role**.

---

## 7. Role Lifecycle Rules

### 7.1 Role Assignment Authority

Binding rules:

* Platform roles may be assigned only by authorized platform identities
* Tenant roles may be assigned only by authorized tenant identities **within the same tenant**
* No identity may assign roles outside its active scope

Cross-scope role assignment is forbidden.

---

### 7.2 Role Bootstrap Rule

Initial role authority is established **only through explicit, governed platform actions**.

There are:

* No implicit admins
* No “first user” shortcuts
* No environment-based authority
* No configuration-based elevation

If initial authority cannot be audited, it is invalid.

---

### 7.3 Role Modification and Evolution

Role definitions may evolve, but:

* Changes are controlled by the owning scope
* Changes apply prospectively
* Silent privilege expansion is forbidden

Any privilege expansion must be:

* Explicit
* Audited
* Justified

---

### 7.4 Role Revocation and Identity State

Rules:

* Revocation is immediate
* Revoked roles grant zero residual permissions
* Identity suspension overrides all roles
* Identity termination voids all effective access

Roles never override identity lifecycle state.

---

## 8. Permission Model (Authoritative)

### 8.1 Permission Definition

A **Permission** represents the ability to perform **one specific action** on **one category of resource**.

Permissions are:

* Explicit
* Finite
* Evaluated per request

Permissions must never be inferred from naming, hierarchy, or identity attributes.

---

### 8.2 Permission Evaluation Rules

Authorization evaluation follows these rules:

1. Evaluated per request
2. Explicit grant required
3. Multiple roles may combine permissions
4. Absence of permission = denial
5. Deny-by-default is absolute

Authorization must be deterministic and reproducible.

---

## 9. Tenant Isolation via Authorization

Authorization enforces tenant isolation by design:

* Tenant-scoped permissions apply only within the active tenant
* Tenant permissions cannot reference other tenants’ resources
* Cross-tenant authorization is forbidden

Platform-level permissions may observe across tenants **only in supervisory scope**
They must never act operationally on behalf of tenants.

---

## 10. Session and Scope Relationship (Conceptual)

### 10.1 Session Definition

A **Session** represents a temporary interaction context between:

* A verified identity
* The platform

Sessions exist to:

* Maintain continuity
* Carry active scope
* Anchor context over time

Sessions are **not**:

* Identities
* Roles
* Permission grants

Sessions must not cache authorization decisions.

---

### 10.2 Active Scope Rule

At any moment, a session operates in **exactly one active scope**:

* Platform
* Tenant
* Customer

Rules:

* Scope is explicit
* Scope is validated
* Scope is immutable until explicitly changed

If active scope is unclear, the request fails.

---

## 11. Scope Establishment and Switching Rules

### 11.1 Scope Establishment

Scope establishment requires:

1. Authenticated identity
2. Scope compatible with identity
3. Explicit selection
4. Independent validation

Scope is **not** part of authentication.

---

### 11.2 Context Switching

Some identities may operate in multiple scopes over time.

Rules:

* Switching is explicit
* Switching revalidates scope
* Switching resets authorization evaluation
* No permissions carry over implicitly

Silent or automatic switching is forbidden.

---

## 12. Authorization Failure Behavior

Authorization failure:

* Produces no side effects
* Leaks no information about resource existence
* Is observable and auditable

Failure is final for that request.

---

## 13. Explicitly Forbidden Anti-Patterns

The following are structural violations:

* Authorization based on user attributes alone
* Implicit permission inheritance
* Hard-coded role checks in business logic
* UI-only authorization enforcement
* Multi-scope sessions
* Side effects during authorization
* Authorization without confirmed scope

These are not shortcuts — they are system breaks.

---

## 14. Auditability Guarantees

The system must always be able to answer:

* Who attempted what?
* Under which scope?
* Which roles and permissions were evaluated?
* Why was access allowed or denied?

Authorization must be explainable after the fact.

---

## 15. Outcome (Guaranteed)

Upon approval:

* Authorization remains deterministic and side-effect-free
* Role governance is explicit and defensible
* Scope confusion is structurally prevented
* Tenant isolation is preserved under IAM complexity
* Future features cannot silently weaken access control

---

## 16. Status

**Status:** Approved
