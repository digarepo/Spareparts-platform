import { AsyncLocalStorage } from "node:async_hooks";
import type { RequestContext } from "@spareparts/contracts";

/**
 * Represents contextual information associated with the current request.
 *
 * This context is automatically propagated across async boundaries
 * using Node.js AsyncLocalStorage, allowing services and repositories
 * to access request metadata without explicitly passing parameters.
 */
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
 *   { correlationId, actor, tenantId },
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
