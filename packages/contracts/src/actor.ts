import { z } from 'zod';

import { CustomerIdSchema, TenantIdSchema, UserIdSchema } from './ids';
import { ScopeSchema } from './scope';

/**
 * Defines a request actor (who is initiating the request).
 *
 * @remarks
 *  - **Authority:** authentication/ session boundary
 *  - **Invariants:**
 *      - Actor kind + scope must be consistent
 *      - Tenant actors must include tenantId
 *      - Roles are non-authoritative until IAM phase (phase 3)
 */
export const ActorSchema = z.discriminatedUnion('kind', [
    z.object({
        kind: z.literal('anonymous'),
        scope: z.literal('customer'),
    }),
    z.object({
        kind: z.literal('customer'),
        scope: z.literal('customer'),
    }),
    z.object({
        kind: z.literal('tenant'),
        scope: z.literal('tenant'),
        userId: UserIdSchema,
        tenantId: TenantIdSchema,
        /**
         * Non-authoritative role keys.
         *
         * @remarks
         *  - These may be present for audit/logging
         *  - Do not rely on them for authorization semantics until IAM is implemented
         */
        roles: z.array(z.string().min(1)).optional(),
    }),
    z.object({
        kind: z.literal('platform'),
        scope: z.literal('platform'),
        userId: UserIdSchema,
        /**
         * Non-authoritative role keys.
         *
         * @remarks
         *  - Do not implement privileged platform capabilities without explicit governance.
         */
        roles: z.array(z.string().min(1)).optional(),
    }),
])

export type Actor = z.infer<typeof ActorSchema>;

/**
 * Validates that an actor is consistent with scope rules.
 *
 * @param actor - Actor to validate.
 * @returns The actor if valid.
 *
 * @throws Error - If actor scope and kind are inconsistent.
 *
 * @remarks
 * This is a contracts layer invariant check (fail closed).
 */
export function assertActorConsistency(actor: Actor): Actor {
    // zod already enforces most invariants: this is for future expansion.
    // we keep it explicit to avoid "silent" widening of shapes.
    const parsed = ActorSchema.safeParse(actor.scope);
    if(!parsed.success) {
        throw new Error('Invalid Actor shape');
    }

    // Ensure scope is one of the known scope classes (defensive).
    const scopeParsed = ScopeSchema.safeParse(actor.scope);
    if(!scopeParsed.success) {
        throw new Error('Invalid actor scope');
    }

    return actor;
}
