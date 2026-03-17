import type { Prisma, PrismaClient } from "@prisma/client";

import type { DbRlsContext } from "./context";
import { applyRlsContext } from "./context";

/**
 * Runs a prisma transaction with RLS context applied (fail closed).
 *
 * @param Prisma - Prisma client.
 * @param ctx - RLS context.
 * @param fn - Transaction body.
 * @returns Result of the transaction function.
 *
 * @remarks
 *  Always prefer this helper for tenant scoped operations so RLS is consistently applied.
 */
export async function withRlsTransaction<T>(
    Prisma: PrismaClient,
    ctx: DbRlsContext,
    fn: (tx: Prisma.TransactionClient) => Promise<T>,
): Promise<T> {
    return Prisma.$transaction(async (tx) => {
        await applyRlsContext(tx , ctx);
        return fn(tx);
    })
}
