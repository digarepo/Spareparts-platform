import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import type { RequestContext } from "@spareparts/contracts";

/**
 * Extracts request context from the request.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** middleware pipeline
 * - **Invariants:** request context is always validated before reaching handlers
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const CurrentRequest = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): RequestContext => {
        const request = ctx.switchToHttp().getRequest();
        return request.requestContext || request.tenantcontext;
    },
);
