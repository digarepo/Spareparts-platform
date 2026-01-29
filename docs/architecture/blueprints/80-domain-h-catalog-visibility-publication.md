# Blueprint Domain H — Catalog Visibility & Publication State
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural rules** governing **catalog visibility** and **publication state** for products.

Its purpose is to:

- Prevent accidental exposure of tenant data
- Separate *what exists* from *what is offered* and *who can see it*
- Ensure visibility and publication transitions are intentional, auditable, and reversible

This document is **authoritative**.
Any catalog behavior that violates these rules is **non-compliant by design**.

---

## 2. Core Separation: Visibility vs Publication

**Visibility** and **Publication** are distinct and must never be conflated.

- **Publication** answers: *Is this product offered for sale?*
- **Visibility** answers: *Who can see this product?*

These dimensions are **independent**.

A product may be:
- Visible internally but not published
- Published but not visible to customers
- Neither visible nor published

Any design that couples these concepts is invalid.

---

## 3. Visibility Scopes (Closed Set)

Visibility is evaluated only within the following **explicit scopes**:

1. **Tenant-Internal Visibility**
2. **Public Customer Visibility**
3. **Platform Supervisory Visibility**

No additional visibility scopes exist in the MVP.

---

### 3.1 Tenant-Internal Visibility

Tenant-internal visibility governs **tenant staff access** to their own catalog.

Structural rules:

- All products owned by a tenant are visible to that tenant’s authorized staff
- Draft, inactive, and unpublished products are fully visible internally
- Tenant-internal visibility never crosses tenant boundaries
- Internal visibility does **not** imply publication or customer exposure

Tenant-internal visibility exists to enable safe iteration and management.

---

### 3.2 Public Customer Visibility

Public customer visibility governs **customer-facing exposure**.

Structural rules:

- Only **published** products may be publicly visible
- Public visibility applies uniformly to authenticated and guest customers
- Public visibility does **not** imply availability, stock, or purchaseability
- Absence of publication implies absence of public visibility

Public visibility must always be **explicitly enabled**, never inferred.

---

### 3.3 Platform Supervisory Visibility

Platform supervisory visibility exists for **governance and compliance**.

Structural rules:

- Platform staff may observe catalog metadata across tenants
- Supervisory visibility is read-only by default
- Visibility does not grant editorial or commercial control
- Platform visibility does not override tenant ownership

The platform observes; it does not curate.

---

## 4. Publication State (Authoritative)

Publication state determines whether a product is **offered for sale**.

Recognized publication states include:

- **Draft** — not offered for sale
- **Published** — offered for sale
- **Unpublished / Inactive** — withdrawn from sale

Publication state:

- Does not affect product identity
- Does not delete or merge products
- Exists independently of visibility scope

Publication affects **offering**, not **existence**.

---

## 5. Draft Semantics (Non-Negotiable)

A product in **Draft** state:

- Is never publicly visible
- Is visible only within tenant-internal and platform supervisory scopes
- Is not offered for sale
- May be freely modified within tenant authority

Draft state exists to prevent premature exposure.

---

## 6. Publication Authority and Boundaries

The following rules are binding:

- Only the owning tenant may publish or unpublish its products
- Publication authority is tenant-scoped and identity-bound
- Platform staff cannot publish on behalf of tenants
- Customers cannot affect publication state

Publication is an **explicit tenant decision**, not a system inference.

---

## 7. Publication Preconditions (Structural)

A product may enter a published state only if:

- The product definition is complete by domain standards
- Publication intent is explicit
- The action is authorized and auditable

Failure to meet preconditions must block publication.

---

## 8. Unpublication and Withdrawal Semantics

Unpublishing a product:

- Removes it from public customer visibility
- Preserves tenant-internal and platform supervisory visibility
- Preserves product identity and historical references

Unpublication must **never**:

- Delete the product
- Break historical orders or audits
- Alter identifiers or ownership

Withdrawal affects exposure, not history.

---

## 9. What Visibility and Publication Do NOT Imply

Visibility and publication **do not** imply:

- Inventory availability
- Pricing existence
- Purchaseability
- Fulfillment readiness
- Search ranking or prominence

Any system that infers these from visibility or publication is broken.

---

## 10. State Transition Invariants

All visibility and publication state transitions must be:

- Explicit
- Authorized
- Auditable
- Reversible (except where prohibited by other domains)

Implicit transitions are forbidden.

State transitions must not:
- Cascade across tenants
- Be triggered by inventory, pricing, or external signals
- Change product identity or ownership

---

## 11. Temporal and Conditional Visibility (Prohibition)

In the MVP:

- Visibility must not be time-based
- Visibility must not be conditionally inferred
- Visibility must not depend on inventory or pricing state

If introduced later, conditional visibility requires a new Foundation decision.

---

## 12. Explicitly Forbidden Anti-Patterns

The following are **structural violations**:

- Auto-publication on product creation
- Publishing triggered by inventory presence
- Visibility inferred from pricing
- Platform-forced publication
- Cross-tenant catalog exposure
- “Soft” publication states without explicit meaning

Visibility must be **intentional**, not emergent.

---

## 13. Auditability Requirement

The system must be able to answer:

- Who published or unpublished a product?
- When did the change occur?
- Under which tenant authority?
- What the prior state was

If these cannot be reconstructed, the model is invalid.

---

## 14. Outcome (Guaranteed)

Upon approval:

- Catalog exposure is predictable and safe
- Tenants retain full control over publication
- Customers see only intentional offerings
- Platform governance remains observational
- Downstream catalog logic has a clean, stable contract

---

## 15. Status

**Status:** Approved
