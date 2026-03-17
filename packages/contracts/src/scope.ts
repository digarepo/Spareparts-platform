import { z } from 'zod';

/**
 * Defines the allowed execution scope classes for requests.
 *
 * @remarks
 * - **Scope:** platform|tenant|customer
 * - **Authority:** request authentication + routing boundary
 * - **Invariants:**
 *      - scope is explicit
 *      - scope doesn't change mid-request
 *      - ambiguous request must fail closed
 */
export const ScopeSchema = z.enum(['platform', 'tenant', 'customer']);

export type Scope = z.infer<typeof ScopeSchema>;
