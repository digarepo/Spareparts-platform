# Blueprint Domain I — Taxonomy, Classification & Navigation
**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **structural rules** governing **taxonomy, categories, and classification** within the catalog.

Its purpose is to:

- Enable consistent product grouping for discovery
- Preserve tenant independence and isolation
- Prevent semantic drift and category misuse
- Ensure classification remains descriptive, not prescriptive

This document is **authoritative**.
Any catalog design that violates these rules is **non-compliant by definition**.

---

## 2. Core Concepts (Closed Set)

The catalog classification model consists of **three distinct concepts**:

1. **Category** — a navigational grouping
2. **Taxonomy** — the structural system organizing categories
3. **Classification Assignment** — the act of associating a product with categories

These concepts are related but **not interchangeable**.

Conflating them is a **structural violation**.

---

## 3. Category Semantics

### 3.1 Definition

A **Category** is a **logical grouping** used to organize products for browsing and navigation.

A category:

- Describes *where a product appears* in navigation
- Does **not** define what a product is
- Does **not** imply compatibility, equivalence, pricing, or availability
- Has no authority over product behavior

A category answers:
> “Under which navigational grouping can this product be found?”

---

### 3.2 Category Non-Authority Rule

Categories must **never** control or imply:

- Product identity
- Variant structure
- Pricing
- Inventory
- Purchaseability
- Visibility or publication
- Authorization or access

If removing a category changes product meaning, the model is broken.

---

## 4. Taxonomy Semantics

### 4.1 Definition

A **Taxonomy** is the **structured system of categories**.

A taxonomy:

- Defines relationships between categories
- May be hierarchical or multi-level
- Exists to support **navigation and discovery**
- Encodes *organizational intent*, not business rules

Taxonomy describes **structure**, not **semantics**.

---

### 4.2 Taxonomy Scope Rule

Taxonomy:

- Applies only to navigation and classification
- Has no authority over catalog operations
- Must not leak into product modeling, pricing, or availability

Taxonomy is **informational**, not operational.

---

## 5. Classification Assignment Semantics

### 5.1 Definition

**Classification Assignment** is the explicit association of a product with one or more categories.

Rules:

- A product may belong to **zero or more** categories
- Classification does not alter product or variant identity
- Classification does not imply equivalence across products
- Absence of classification is valid

Classification answers *where a product appears*, not *what it is*.

---

### 5.2 Explicit Assignment Rule

Classification must be:

- Explicit
- Intentional
- Auditable

Automatic or inferred classification is forbidden.

---

## 6. Ownership and Governance

### 6.1 Platform-Owned Taxonomy

The platform may define and govern a **platform-level taxonomy** to support:

- Consistent customer navigation
- Cross-tenant discovery alignment
- Shared navigational language

Rules:

- Platform taxonomy is **read-only** for tenants
- Platform taxonomy does not override tenant ownership
- Platform taxonomy does not create canonical products
- Platform taxonomy does not enforce mandatory classification

The platform governs **structure**, not content.

---

### 6.2 Tenant Participation Rules

Tenants may:

- Assign their products to platform-defined categories
- Choose not to classify products at all

Tenants must not:

- Modify platform taxonomy
- Create categories visible across tenants
- Depend on classification for business rules

Classification usage is **optional and tenant-controlled**.

---

## 7. Tenant-Defined Classification (Isolation Rule)

Tenants may maintain **internal classification systems** for their own use.

Rules:

- Tenant-defined categories are tenant-scoped
- Tenant-defined categories must not leak across tenants
- Tenant-defined categories must not be treated as shared taxonomy

No tenant may impose classification semantics on another tenant.

---

## 8. Classification vs Attributes (Hard Boundary)

Categories must **not** substitute for attributes.

Rules:

- Categories group products
- Attributes describe product properties
- Attributes define identity and variants
- Categories never do

If a category is used to encode a product property, the boundary has been violated.

---

## 9. Cross-Tenant Semantics (Non-Equivalence Rule)

Category placement:

- Does not imply product equivalence across tenants
- Does not imply shared standards or compatibility
- Does not weaken tenant isolation
- Does not create canonical or global products

Shared classification does **not** imply sameness.

---

## 10. Stability and Evolution Rules

Categories and taxonomies may evolve, but:

- Changes must be backward-aware
- Historical classification must remain reconstructable
- Removal must not erase historical meaning

Evolution must not:

- Reinterpret past orders or audits
- Alter product identity retroactively
- Break traceability

Classification history must remain explainable.

---

## 11. What Taxonomy Controls — and What It Must Never Control

### 11.1 Taxonomy May Control

- Navigational grouping
- Discovery structure
- Browsing context

### 11.2 Taxonomy Must Never Control

- Product identity
- Variant structure
- Pricing or discounts
- Inventory or availability
- Visibility or publication
- Authorization or access
- Business rules or logic

If taxonomy controls behavior, the architecture is invalid.

---

## 12. Explicitly Forbidden Anti-Patterns

The following are **structural violations**:

- Category-based product identity
- Category-driven pricing or availability
- Tenant-defined categories exposed cross-tenant
- Category-based authorization or visibility
- Implicit or automatic classification
- Encoding attributes as categories

Classification must remain **descriptive only**.

---

## 13. Auditability Requirement

The system must be able to answer:

- Which categories existed at a given time?
- Which taxonomy structure was active?
- Which products were assigned to which categories?
- Who performed classification changes?

If classification history cannot be reconstructed, the model is broken.

---

## 14. Outcome (Guaranteed)

Upon approval:

- Product grouping remains predictable and safe
- Tenant ownership and isolation are preserved
- Navigation scales without semantic collapse
- Classification supports discovery without controlling behavior
- Future catalog features inherit a stable boundary

---

## 15. Status

**Status:** Approved
