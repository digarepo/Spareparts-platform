import { Prisma, PrismaClient } from '@prisma/client';

/**
 * RLS actor kinds recognized by database policies.
 *
 * @remarks
 *  - These must match the values used in RLS SQL (`app.actor_kind`).
 *  - Keep stable; changing values rerquires coordinated DB + app rollout.
 */
export type DbActorKind = 'platform' | 'tenant' | 'customer' | 'anonymous';

export type DbRlsContext = {
    actorKind: DbActorKind;
    /**
     * Tenant context identifier for tenant-scoped execution.
     *
     * @remarks
     *  - ULID store as text in DB.
     *  - Must be set only for tenant actor requests.
     */
    tenantId?: string;
};

/**
 * A prisma client capable of executing SQL commands.
 *
 * @remarks
 * This covers both:
 *  - `PrismaClient` (normal client)
 *  - `Prisma.TransactionClient` (interactive tx client)
 */
export type DbSqlClient = PrismaClient | Prisma.TransactionClient;

/**
 * Applies RLS session context variables to the current transaction.
 *
 * @param prisma - Prisma client instance.
 * @param ctx - RLS context for the current request.
 * @returns void
 *
 * @throws Error - If invalid combinations are provided (fail closed).
 *
 * @remarks
 *  - Uses `SET LOCAL` so values apply only to the current transaction scope.
 *  - Must be called inside `$transaction(...)` to guarantee scope.
 */
export async function applyRlsContext(client: DbSqlClient, ctx:DbRlsContext): Promise<void> {
    if(ctx.actorKind === 'tenant') {
        if(!ctx.tenantId) {
            throw new Error('SCOPE_VIOLATION: tenant actorKind requires tenantId');
        }
    } else if(ctx.tenantId){
        throw new Error('SCOPE_VIOLATION: non-tenant actorKind must not set tenantId');
    }

    await client.$executeRaw`select set_config('app.actor_kind', ${ctx.actorKind}, true)`;

    if(ctx.tenantId) {
        await client.$executeRaw`select set_config('app.tenant_id', ${ctx.tenantId}, true)`;
    } else {
        // ensure tenant_id is empty for non-tenant scopes to avoid stale context in long-lived sessions.
        await client.$executeRaw`select set_config('app.tenant_id', '', true)`;
    }
}
