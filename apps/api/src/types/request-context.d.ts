/**
 * Type extensions for Express Request to include context.
 *
 * @remarks
 * - **Scope:** infrastructure
 * - **Authority:** type augmentation only
 * - **Threading/Async:** not applicable
 * - **Tenancy:** enables context access across request lifecycle
 */

import type { RequestContext } from '@spareparts/contracts';

declare global {
  namespace Express {
    interface Request {
      context?: RequestContext;
    }
  }
}
