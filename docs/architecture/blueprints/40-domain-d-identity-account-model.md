# Blueprint Domain D — Identity & Account Model

**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **non-negotiable rules** governing:

* What constitutes an identity
* How identities differ from accounts
* Identity categories and boundaries
* Identity lifecycle states and transitions
* Recovery, deactivation, and termination semantics

These rules are **structural invariants**.

If any part of the system cannot enforce them by design, the system is **non-compliant**.

---

## 2. Identity: Definition (Authoritative)

An **Identity** is a **globally unique, persistent principal** recognized by the platform.

Identity exists to answer:

* **Who** is acting
* **Under which authority**
* **Within which scope**

### Identity is NOT:

* A session
* A role
* A permission set
* An account container
* A UI concept

Identity is **foundational** and exists independently of how access is exercised.

---

## 3. Identity vs Account (Hard Separation)

### 3.1 Identity

* Represents a **principal**
* Is globally unique
* Persists across sessions
* Has a lifecycle
* Is immutable in meaning once created

### 3.2 Account

An **Account** is a **contextual container** that:

* Belongs to exactly one identity
* Exists within a specific scope (platform, tenant, customer)
* Holds configuration, preferences, and associations
* May be suspended, closed, or restricted independently

### Binding Rules

* One identity may own **multiple accounts**
* One account may belong to **exactly one identity**
* Accounts never exist without an identity
* Identities do not inherit authority from accounts implicitly

Identity answers **who**.
Account answers **where and how that identity participates**.

---

## 4. Authoritative Identity Categories

The MVP recognizes **exactly four identity categories**.

No additional categories exist unless introduced via a new IAM or Discovery decision.

---

### 4.1 Platform Staff Identity

An identity associated with the **Platform Owner Organization**.

Structural rules:

* Operates only in **platform scope**
* Has no tenant affiliation
* Cannot act as customer or tenant staff
* Authority is supervisory, not commercial

Platform staff identities exist to **govern**, not to transact.

---

### 4.2 Tenant Staff Identity

An identity associated with **exactly one tenant**.

Structural rules:

* Tenant association is mandatory and immutable
* Operates only in **tenant scope**
* Cannot span multiple tenants
* Cannot act outside assigned tenant context

Cross-tenant identities are **forbidden**.

---

### 4.3 Customer Identity

An identity associated with an **end customer**.

Structural rules:

* Operates only in **customer scope**
* May interact with multiple tenants **as a buyer**
* Has no authority over tenant internals
* Access is limited to self-owned data

Customer identities never gain tenant or platform authority.

---

### 4.4 Guest (Non-Identity)

A **guest is not an identity**.

Rules:

* No persistence
* No lifecycle
* No authority
* No historical attribution

Guests are treated as **unauthenticated actors**, not identities.

---

## 5. Identity Uniqueness and Persistence

The following are **system invariants**:

* Every identity is globally unique
* Identity identifiers are never reused
* Identity meaning never changes
* Identity persists beyond session or account state

Identity uniqueness is a **security boundary**, not an optimization.

---

## 6. Identity and Scope (Alignment Rule)

Identity does **not** imply scope.

Rules:

* Identity category constrains *possible* scopes
* Active scope is always explicit
* Identity may operate in **one scope per execution**
* Scope switching requires a new execution context

No system component may infer scope from identity alone.

---

## 7. Identity Lifecycle States (Authoritative)

Identity lifecycle affects **effective authority**, not existence.

### Recognized States

* **Active**
* **Suspended**
* **Deactivated**
* **Terminated**

States are mutually exclusive and explicit.

---

### 7.1 Active

* Identity is valid
* May authenticate
* May exercise authority within assigned scope

---

### 7.2 Suspended

* Identity exists
* Access is temporarily disabled
* Used for security or policy intervention
* Fully reversible

Suspension removes **effective authority**, not identity.

---

### 7.3 Deactivated

* Identity exists
* Access disabled intentionally
* Roles retained but inactive
* Sessions invalidated

Deactivation is a **controlled shutdown**, not deletion.

---

### 7.4 Terminated

* Identity is permanently ended
* All effective authority ceases
* Irreversible

Termination does **not** remove historical attribution.

---

## 8. Recovery Semantics (Strict)

Recovery applies **only** to non-terminated identities.

Rules:

* Recovery restores access, not authority changes
* No role, scope, or permission expansion is allowed
* Recovery must be verified and auditable
* If safe restoration cannot be guaranteed, recovery must fail

Recovery never creates a new identity.

---

## 9. Deactivation Semantics

When an identity is deactivated:

* All sessions are invalidated
* All authorization checks must fail
* Identity and historical data remain intact
* Reactivation requires explicit authorization

Deactivated identities exert **zero effective authority**.

---

## 10. Termination Semantics (Non-Negotiable)

Termination guarantees:

* Identity can never be reused
* Authority is permanently revoked
* Historical records remain attributable
* No implicit reinstatement is possible

Any future access requires a **new identity**.

---

## 11. Identity vs Data (Separation Rule)

Identity lifecycle actions:

* Do **not** delete historical data
* Do **not** anonymize audit records implicitly
* Do **not** rewrite ownership history

Data integrity overrides convenience and privacy shortcuts.

---

## 12. Enforceability Requirements

The system must be able to prove:

* Identity category at runtime
* Identity lifecycle state
* Scope compatibility
* Authority revocation on state change

If this cannot be proven structurally, the design is invalid.

---

## 13. Explicitly Forbidden Anti-Patterns

The following are **architectural violations**:

* Shared identities
* Identity reuse after termination
* Implicit reactivation
* Role restoration during recovery
* Inferring identity from session or request shape
* Treating accounts as identities

These are **design failures**, not bugs.

---

## 14. Outcome (Guaranteed)

Upon approval of this blueprint:

* Identity meaning is unambiguous
* Account semantics are cleanly separated
* Lifecycle transitions are governed
* IAM enforcement becomes structurally sound
* Future IAM features have a stable foundation

---

## 15. Status

**Status:** Approved
