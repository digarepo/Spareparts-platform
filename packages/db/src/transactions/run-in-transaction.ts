import { PrismaClient, Prisma } from "@prisma/client";

/**
 * Shared Prisma client instance.
 *
 * In most architectures this is created once per service
 * and reused across requests to avoid connection exhaustion.
 */
const prisma = new PrismaClient();

/**
 * Options used to configure a database transaction.
 */
export interface TransactionOptions {
  /**
   * Maximum time (ms) the transaction can run before aborting.
   * Helps prevent long-running locks.
   *
   * @default 5000
   */
  timeout?: number;

  /**
   * Maximum time (ms) the system will wait to acquire a transaction slot.
   *
   * @default 2000
   */
  maxWait?: number;

  /**
   * Isolation level for the transaction.
   *
   * Serializable is recommended for inventory systems
   * to prevent race conditions and overselling.
   *
   * @default Prisma.TransactionIsolationLevel.Serializable
   */
  isolationLevel?: Prisma.TransactionIsolationLevel;
}

/**
 * Executes a function inside a database transaction.
 *
 * This helper ensures:
 *
 * - Atomic database operations
 * - Consistent transaction configuration
 * - Centralized error handling
 * - Safe concurrency behavior
 *
 * It should be used for **all multi-step database mutations**
 * such as:
 *
 * - inventory reservations
 * - checkout operations
 * - stock adjustments
 * - order placement
 *
 * Example:
 *
 * ```ts
 * await runInTransaction(async (tx) => {
 *   const inventory = await tx.inventory.findUnique({
 *     where: { variant_id: variantId }
 *   });
 *
 *   if (!inventory) {
 *     throw new Error("Inventory record not found");
 *   }
 *
 *   if (inventory.on_hand - inventory.reserved < quantity) {
 *     throw new Error("Insufficient inventory");
 *   }
 *
 *   await tx.inventory.update({
 *     where: { variant_id: variantId },
 *     data: {
 *       reserved: { increment: quantity }
 *     }
 *   });
 * });
 * ```
 *
 * @typeParam T - The return type of the transaction callback.
 *
 * @param operation
 * The async function that will run inside the transaction.
 * Receives the Prisma transaction client.
 *
 * @param options
 * Optional transaction configuration.
 *
 * @returns
 * Resolves with the value returned by the operation callback.
 *
 * @throws
 * Re-throws any error produced inside the transaction.
 */
export async function runInTransaction<T>(
  operation: (tx: Prisma.TransactionClient) => Promise<T>,
  options: TransactionOptions = {}
): Promise<T> {
  const {
    timeout = 5000,
    maxWait = 2000,
    isolationLevel = Prisma.TransactionIsolationLevel.Serializable,
  } = options;

  try {
    return await prisma.$transaction(operation, {
      timeout,
      maxWait,
      isolationLevel,
    });
  } catch (error) {
    /**
     * Centralized transaction error handling.
     *
     * This is a good place to integrate:
     *
     * - structured logging
     * - observability (OpenTelemetry)
     * - Sentry
     * - retry policies
     */
    console.error("Transaction failed", {
      error,
      isolationLevel,
      timeout,
      maxWait,
    });

    throw error;
  }
}
