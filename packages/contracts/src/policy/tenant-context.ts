import { type Actor } from "../actor";
import { type RequestContext } from "../context";

/**
 * Asserts that tenant context is consistent with the actor and scope rules.
 *
 * @param ctx - Request context introduced at the trust boundary.
 * @returns The same context if valid.
 *
 * @throws Error - If tenant context is missing, inconsistent or present when permitted.
 *
 * @remarks
 *  - **Faile closed:** ambiguity or partial information is treated as invalid.
 *  - **Invariant:**
 *      - tenant-scoped execution requires an explicit tenantId at the boundary.
 *      - tenantId cannot change mid-request and cannot be infferred from payload.
 */
export function assertTenantContextConsistency(ctx: RequestContext): RequestContext {
    const actor: Actor = ctx.actor;

    if(actor.kind === 'tenant') {
        if(!ctx.tenantId) {
            throw new Error('SCOPE_VIOLATION: tenant-scoped actor requires ctx.tenantId');
        }
        if(ctx.tenantId !== actor.tenantId) {
            throw new Error('SCOPE_VIOLATION: ctx.tenantId must match actor.tenantId');
        }
        return ctx;
    }

    if(ctx.tenantId) {
        throw new Error('SCOPE_VIOLATION: non-tenant actor must not include ctx.tenantId');
    }
    return ctx;
}
