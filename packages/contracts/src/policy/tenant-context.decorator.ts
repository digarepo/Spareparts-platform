/**
 * Decorator for extracting tenant context from request.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** request context extraction
 * - **Threading/Async:** synchronous decorator execution
 * - **Tenancy:** ensures tenant context is available
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestContext } from '../context';

/**
 * Custom parameter decorator to extract tenant context from request.
 *
 * @param data - Optional decorator data (not used)
 * @param ctx - NestJS execution context
 * @returns RequestContext with tenant information
 *
 * @throws Error - When tenant context is missing from request
 *
 * @remarks
 * - Extracts tenant context from the request object set by RequestContextMiddleware
 * - The middleware should attach the context to the request object
 * - Used by controllers to enforce tenant isolation
 * - This decorator assumes the middleware stores context on the request
 */
export const TenantContext = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): RequestContext => {
    const request = ctx.switchToHttp().getRequest();

    // The RequestContextMiddleware sets the context on the request
    const tenantContext = request.context;

    if (!tenantContext) {
      throw new Error(
        'Tenant context not found in request. Ensure RequestContextMiddleware is properly configured and attaches context to the request object.'
      );
    }

    return tenantContext;
  },
);
