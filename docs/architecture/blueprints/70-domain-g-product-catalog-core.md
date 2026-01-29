# Blueprint Domain G — Product & Catalog Core Model

**(Authoritative Source of Truth)**

---

## 1. Purpose and Authority

This blueprint defines the **core conceptual model of Product and Catalog** for the platform.

Its purpose is to:

* Establish a **single, unambiguous definition of “Product”**
* Define **structural boundaries** between product, variant, and identifiers
* Enforce **tenant ownership and catalog isolation**
* Prevent semantic drift across inventory, pricing, search, and orders

This blueprint is **authoritative**.
Any catalog-related design that violates these rules is **non-compliant by definition**.

---

## 2. Core Concept: What a Product Is

### 2.1 Authoritative Definition

A **Product** is a **tenant-owned catalog entity** representing a **specific spare part offering**.

A Product:

* Is defined by **exactly one tenant**
* Represents *what is being sold*, not whether it is sellable
* Exists independently of inventory, pricing, fulfillment, or visibility
* Serves as the **anchor identity** for all downstream catalog concepts

A Product is a **semantic object**, not an operational one.

---

### 2.2 What a Product Is NOT

A Product is not:

* Inventory
* A price list entry
* A listing or advertisement
* A UI construct
* A fulfillment unit
* A transactional record

Conflating Product with any of the above is a **structural violation**.

---

## 3. Product Ownership (Non-Negotiable)

### 3.1 Ownership Rules

The following invariants apply:

* Every Product is owned by **exactly one tenant**
* Product ownership is **immutable**
* Products cannot be transferred between tenants
* Platform operators do not own products
* Customers do not own products

Ownership determines **who may define, modify, or retire** a product.

---

### 3.2 Platform Role (Governance Only)

The platform:

* May observe product data
* May enforce platform-level policy constraints
* Must not create, edit, or merge products

The platform is a **governor**, never a catalog author.

---

## 4. Catalog Scope and Isolation

### 4.1 Catalog Structure

The platform exposes a **logical global catalog view** composed of **strictly isolated tenant catalogs**.

Rules:

* Each tenant has its own catalog namespace
* Products never cross tenant boundaries
* Similar or identical real-world parts across tenants remain **distinct products**

Similarity does **not** imply shared identity.

---

### 4.2 Isolation Invariants

Catalog isolation must hold:

* Structurally
* Semantically
* Under partial failure
* Under search and comparison

Any design that merges or aliases tenant products violates isolation.

---

## 5. Product vs Variant Semantics

### 5.1 Product vs Variant Boundary

A **Product** defines a *part concept*.
A **Variant** defines a *specific sellable configuration* of that product.

Binding rules:

* A Product may have **zero or more variants**
* A Variant must belong to **exactly one product**
* Variants cannot exist independently
* Product identity remains stable across all variants

A Variant refines a Product; it does not replace it.

---

### 5.2 When a Variant Exists

If changing a characteristic changes **what the customer is buying**, that characteristic is **variant-defining**.

If changing a characteristic does *not* change the purchased item, it is **not** variant-defining.

Misclassifying this boundary is a **modeling error**.

---

## 6. Attribute Categories (Authoritative)

Every product-related attribute belongs to **exactly one category**.

No attribute may straddle categories.

---

### 6.1 Structural (Core) Attributes

Structural attributes:

* Define the **essential identity** of the product
* Apply uniformly across all variants
* Are required for product comprehension

Rules:

* Stable over time
* Meaning does not change
* Tenant-owned
* Required for product existence

If a structural attribute changes meaning, the product identity is broken.

---

### 6.2 Variant-Defining Attributes

Variant-defining attributes:

* Distinguish one variant from another
* Produce **distinct sellable options**
* Are evaluated at customer selection time

Rules:

* Exist only in relation to a product
* Define variant identity
* Must not be optional *within* a variant

If an attribute affects *which item is bought*, it must live here.

---

### 6.3 Descriptive (Supplementary) Attributes

Descriptive attributes:

* Add informational or contextual detail
* Do not affect identity or selection
* Are optional

Rules:

* Must not affect variant identity
* Must not influence downstream logic
* May be added or removed without semantic impact

If removing an attribute changes product meaning, it was miscategorized.

---

## 7. Identifier Semantics

Identifiers exist to **refer**, not to define meaning.

The platform recognizes **three identifier classes**.

---

### 7.1 Internal Identifiers

Internal identifiers:

* Are platform-managed
* Are opaque and stable
* Are never reused
* Exist solely for referential integrity

Internal identifiers must not encode business meaning.

---

### 7.2 Tenant-Defined External Identifiers

Tenant-defined identifiers:

* Are controlled by the tenant
* May map to supplier or internal systems
* Must be unique **within the tenant scope only**

They must not be assumed globally unique.

---

### 7.3 Platform-Assigned Identifiers

Platform-assigned identifiers:

* Enable platform-level reference and navigation
* Support comparison and discovery
* Do **not** establish canonical identity

#### Critical Invariant

Products sharing a platform-assigned identifier:

* Are **not the same product**
* Are **not merged**
* Do **not** share lifecycle, inventory, or pricing
* Remain fully tenant-owned and isolated

Platform identifiers are **referential only**, never semantic.

---

## 8. Uniqueness and Identity Rules

The following rules are absolute:

* Product identity is unique **within a tenant**
* Variant identity is unique **within a product**
* Identifiers are never reused
* Identifiers never change meaning
* Retired products and variants retain their identifiers

Deletion of identity is forbidden.

Identity stability is required for:

* Orders
* Audits
* Analytics
* Historical reasoning

---

## 9. Lifecycle and Identity Stability

Lifecycle state:

* Affects availability and visibility only
* Must not affect identity
* Must not alter historical meaning

Rules:

* Retired products remain referencable
* Variants follow the same identity rules
* Lifecycle changes are explicit and auditable

Identity outlives lifecycle state.

---

## 10. Cross-Tenant Independence (Structural)

Tenants:

* Define their own products
* Define their own attributes and values
* May model similar parts differently

Tenants must not:

* Rely on other tenants’ definitions
* Share implicit schemas
* Be forced into global equivalence

The platform enables comparison, not sameness.

---

## 11. Explicitly Forbidden Anti-Patterns

The following are **structural violations**:

* Encoding variants as separate products
* Encoding products as variants
* Auto-generating products from inventory
* Deriving product identity from pricing or stock
* Product identity inferred from external systems
* Platform-owned or shared products
* Identifiers used to encode business logic

If identity or meaning is inferred, the model is broken.

---

## 12. Enforcement Responsibility

| Layer              | Responsibility                                     |
| ------------------ | -------------------------------------------------- |
| **Domain**         | Define product meaning and invariants              |
| **Contracts**      | Expose product, variant, and identifier boundaries |
| **Application**    | Respect ownership and scope                        |
| **Infrastructure** | Enforce isolation and identifier stability         |

No single layer may redefine product meaning.

---

## 13. Outcome (Guaranteed)

Upon approval:

* “Product” has one meaning across the platform
* Tenant catalog isolation is structurally preserved
* Variants cannot be mis-modeled
* Identifiers cannot be abused as semantics
* Downstream catalog features inherit a clean foundation

---

## 14. Status

**Status:** Approved
