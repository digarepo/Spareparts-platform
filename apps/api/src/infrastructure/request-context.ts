import { AsyncLocalStorage } from "node:async_hooks";

/**
 * Represents contextual information associated with the current request.
 *
 * This context is automatically propagated across async boundaries
 * using Node.js AsyncLocalStorage, allowing services and repositories
 * to access request metadata without explicitly passing parameters.
 */
export interface RequestContext {
  /**
   * Tenant identifier for multi-tenant isolation.
   */
  tenantId: string;

  /**
   * Authenticated user identifier (if present).
   */
  userId?: string;

  /**
   * Unique identifier for the request used in tracing/logging.
   */
  requestId: string;
}

const requestContextStorage = new AsyncLocalStorage<RequestContext>();

/**
 * Executes a function within a request context scope.
 *
 * This should be called at the beginning of every HTTP request,
 * typically in a middleware layer.
 *
 * Example:
 *
 * ```ts
 * runWithRequestContext(
 *   { tenantId, userId, requestId },
 *   () => controllerHandler(req, res)
 * );
 * ```
 *
 * @param context - Request context metadata
 * @param fn - Function to execute within the context
 */
export function runWithRequestContext<T>(
  context: RequestContext,
  fn: () => T
): T {
  return requestContextStorage.run(context, fn);
}

/**
 * Retrieves the current request context.
 *
 * Throws if accessed outside a request lifecycle.
 *
 * @returns {RequestContext}
 */
export function getRequestContext(): RequestContext {
  const ctx = requestContextStorage.getStore();

  if (!ctx) {
    throw new Error(
      "RequestContext unavailable. Ensure runWithRequestContext() was called."
    );
  }

  return ctx;
}
