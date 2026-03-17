import { z } from 'zod';

import { ActorSchema } from './actor';
import { CorrelationIdSchema, TenantIdSchema } from './ids';

/**
 * Request context introduced at the trust boundary (API/server entry).
 *
 * @remarks
 * - **Authority:** server boundary (auth + routing)
 * - **Invariants:**
 *   - tenantId is required for tenant-scoped execution
 *   - tenantId must never be inferred from user payload
 *   - correlationId is safe to log and must be present for request tracing
 */
export const RequestContextSchema = z.object({
  correlationId: CorrelationIdSchema,
  actor: ActorSchema,
  /**
   * Present only when the request is executing under tenant scope.
   *
   * @remarks
   * - This may be redundant with actor.tenantId, but we keep it explicit:
   *   - actor = who you are
   *   - tenantId = which tenant context you are executing under
   */
  tenantId: TenantIdSchema.optional(),
});

export type RequestContext = z.infer<typeof RequestContextSchema>;
