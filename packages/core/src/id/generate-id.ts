import { ulid } from "ulid";

/**
 * Represents a globally unique identifier used across the platform.
 *
 * All domain entities should use this ID type instead of raw strings
 * to improve type safety across services.
 */
export type EntityId = string;

/**
 * Generates a globally unique identifier using the ULID specification.
 *
 * ULIDs provide several advantages over traditional UUIDs:
 *
 * - **Lexicographically sortable** — IDs preserve chronological order
 * - **Database index friendly** — prevents index fragmentation
 * - **Globally unique** — safe across distributed systems
 * - **Fast generation** — nanosecond scale
 * - **URL safe** — no special characters
 *
 * ULIDs are particularly well suited for:
 *
 * - Orders
 * - Events
 * - Inventory records
 * - Cart identifiers
 * - Multi-tenant systems
 *
 * This function should be used whenever a new domain entity ID
 * must be generated before persistence.
 *
 * Example:
 *
 * ```ts
 * const orderId = generateId();
 *
 * await prisma.order.create({
 *   data: {
 *     id: orderId,
 *     tenant_id: tenantId
 *   }
 * });
 * ```
 *
 * @returns {EntityId}
 * A lexicographically sortable globally unique identifier.
 */
export function generateId(): EntityId {
  return ulid();
}
