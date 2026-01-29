# Blueprint Domain J — Pricing, Assets & Change Governance
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural rules** governing:

- Pricing concepts and ownership boundaries
- The relationship between products, variants, and prices
- Media and asset governance
- Mutable vs immutable catalog data
- Change authority, auditability, and traceability

Its purpose is to ensure that **commercial intent, descriptive content, and catalog evolution** remain:

- Explicit
- Tenant-owned
- Auditable
- Structurally isolated from product identity

This document is **authoritative**.
Any catalog behavior that violates these rules is **non-compliant by design**.

---

## 2. Pricing Concepts (Authoritative)

### 2.1 What a Price Is

A **Price** is a **tenant-declared commercial term** under which a product or variant is offered for sale.

A Price:

- Expresses *what the customer pays*
- Is owned and controlled by a tenant
- Exists independently of inventory, orders, and fulfillment
- Is not a calculation, formula, or derived artifact

A price is a **declaration of intent**, not an operational mechanism.

---

### 2.2 What a Price Is NOT

A Price is not:

- Product identity
- Inventory state
- Availability signal
- Discount engine
- Promotion logic
- Order record

Embedding any of the above into pricing is a **structural violation**.

---

## 3. Relationship Between Product, Variant, and Price

The following boundaries are **non-negotiable**:

- A **Product** defines *what exists*
- A **Variant** refines *which specific option exists*
- A **Price** defines *under what commercial terms it is offered*

Rules:

- Prices may apply to a product or to a specific variant
- Prices must never define or imply product or variant identity
- Products and variants may exist without prices
- Prices must not encode inventory, stock, or availability

Coupling identity and pricing breaks catalog integrity.

---

## 4. Pricing Scope and Ownership

### 4.1 Tenant Scope (Exclusive)

Pricing is **tenant-scoped**.

Rules:

- Every price belongs to exactly one tenant
- Prices have no meaning outside the owning tenant
- No global or cross-tenant prices exist

---

### 4.2 Ownership Boundaries

The following ownership rules are binding:

- Only the owning tenant may create, modify, or retire prices
- Platform staff must not set, normalize, or adjust prices
- Customers do not influence price definition

The platform is **commercially neutral**.

---

## 5. Price Identity, Stability, and History

Prices have **stable identity**.

Rules:

- Price identity must persist over time
- Historical prices must remain referencable
- Price changes must not rewrite historical meaning
- Orders must reference the price as it existed at the time of purchase

Retroactive mutation of price meaning is forbidden.

---

## 6. Pricing Lifecycle (Conceptual Only)

Prices may transition between states such as:

- Draft
- Active
- Inactive

Rules:

- Lifecycle affects offerability only
- Lifecycle does not affect product or variant identity
- Transitions must be explicit and auditable

Lifecycle state is **not** business logic.

---

## 7. Media and Asset Governance

### 7.1 Media Asset Definition

A **Media Asset** is a **non-executable binary or visual artifact** associated with a product or variant.

Rules:

- Media illustrates or supplements products
- Media does not define product or variant identity
- Media does not encode business logic

Media communicates; it does not decide.

---

### 7.2 Descriptive Content Definition

**Descriptive Content** is human-readable explanatory information.

Rules:

- Descriptive content is informational, not authoritative
- Structured catalog data always overrides content
- Content must not encode operational rules

If content contradicts structured data, structured data wins.

---

### 7.3 Ownership of Media and Content

Ownership rules are binding:

- Media and content are owned by the tenant
- Platform staff do not author tenant content
- Customers do not modify catalog content

Ownership implies responsibility and accountability.

---

## 8. Association Rules (Media & Pricing)

Associations must be **explicit**.

Rules:

- Prices associate explicitly to products or variants
- Media associates explicitly to products or variants
- Associations must not imply identity or behavior

Implicit association is forbidden.

---

## 9. Mutable vs Immutable Catalog Data

### 9.1 Immutable by Definition

The following must be **immutable in meaning**:

- Product identity
- Variant identity
- Historical prices referenced by orders
- Historical catalog state used for audits

Immutability preserves trust and traceability.

---

### 9.2 Mutable with Governance

The following may change **only under governance**:

- Prices (prospectively)
- Media and descriptive content
- Publication and visibility state
- Classification assignments

Mutation without governance is forbidden.

---

## 10. Catalog Change Governance (Structural)

Any change to catalog state is a **governed action**.

This includes (non-exhaustive):

- Price creation, update, retirement
- Media and content changes
- Association changes
- Publication and visibility changes

No catalog mutation may occur as a side effect.

---

## 11. Change Authority Rules

The following authority rules are binding:

- Only authorized tenant staff may change their tenant’s catalog
- Platform staff must not edit tenant catalog data
- Customers never mutate catalog state

Authority is explicit, scope-bound, and evaluated per action.

---

## 12. Explicit Intent Requirement

All catalog changes must be:

- Explicitly initiated
- Intentional
- Attributable to an identity
- Executed under verified authority

Implicit or automatic mutation is forbidden.

---

## 13. Auditability and Traceability Requirements

Every catalog change must produce an **audit record**.

An audit record must capture:

- Who initiated the change
- Under which tenant scope
- What changed (before and after)
- When the change occurred
- The type of change

Audit records must be:

- Append-only
- Tamper-resistant
- Reconstructable over time

Logs are not audits.

---

## 14. Platform Oversight Boundaries

The platform may:

- Observe catalog changes
- Review audit trails
- Enforce policy constraints

The platform must not:

- Edit tenant catalog data
- Perform retroactive corrections
- “Fix” tenant mistakes directly

Oversight is **observational**, not editorial.

---

## 15. Explicitly Forbidden Anti-Patterns

The following are **structural violations**:

- Global or shared pricing
- Retroactive price mutation
- Media implying pricing or availability
- Platform-authored tenant content
- Silent catalog mutation
- Overwriting historical meaning
- Audit reconstruction from logs only

Governance must be **structural**, not procedural.

---

## 16. Outcome (Guaranteed)

Upon approval:

- Pricing meaning is unambiguous and tenant-owned
- Products, variants, prices, and media remain cleanly separated
- Catalog evolution is intentional and traceable
- Historical correctness is preserved
- Trust and auditability scale with system growth

---

## 17. Status

**Status:** Approved
