import { HttpException, HttpStatus, Injectable, NestMiddleware } from "@nestjs/common";
import { randomUUID } from "crypto";
import type { NextFunction, Request, Response } from "express";

import type { Actor, RequestContext } from "@spareparts/contracts";
import { RequestContextSchema } from "@spareparts/contracts";
import { assertTenantContextConsistency } from "@spareparts/contracts";

import { runWithRequestContext } from "../infrastructure/request-context";

/**
 * Builds a canonical `RequestContext` at the HTTP trust boundary.
 *
 * @remarks
 * For now this is header-based to unblock Slice 5, but all semantics are
 * validated and fail-closed.
 */
@Injectable()
export class RequestContextMiddleware implements NestMiddleware {
  /**
   * Establishes request context and propagates it via AsyncLocalStorage.
   *
   * @param req - Express request.
   * @param _res - Express response.
   * @param next - Next middleware.
   */
  use(req: Request, _res: Response, next: NextFunction): void {
    const ctx = this.buildContextFromHeaders(req);

    // Attach context to request for decorator access
    req.context = ctx;

    runWithRequestContext(ctx, () => {
      next();
    });
  }

  private buildContextFromHeaders(req: Request): RequestContext {
    const correlationId = req.header("x-correlation-id") ?? randomUUID();

    const kind = req.header("x-actor-kind") ?? "anonymous";
    const scope = req.header("x-scope") ?? "customer";
    const tenantIdHeader = req.header("x-tenant-id") ?? undefined;
    const userIdHeader = req.header("x-user-id") ?? undefined;

    const actor = this.buildActor(kind, scope, tenantIdHeader, userIdHeader);

    const candidate: RequestContext = {
      correlationId,
      actor,
      tenantId: tenantIdHeader,
    };

    const parsed = RequestContextSchema.safeParse(candidate);
    if (!parsed.success) {
      throw new HttpException(
        {
          code: "VALIDATION_ERROR",
          message: "Invalid request context",
          details: {
            issues: parsed.error.issues,
          },
        },
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      assertTenantContextConsistency(parsed.data);
    } catch (err) {
      throw new HttpException(
        {
          code: "SCOPE_VIOLATION",
          message: err instanceof Error ? err.message : "SCOPE_VIOLATION",
        },
        HttpStatus.FORBIDDEN
      );
    }

    return parsed.data;
  }

  private buildActor(
    kindHeader: string,
    scopeHeader: string,
    tenantId: string | undefined,
    userId: string | undefined
  ): Actor {
    const kind = kindHeader.toLowerCase();
    const scope = scopeHeader.toLowerCase();

    if (kind === "tenant") {
      if (!tenantId || !userId) {
        throw new HttpException(
          {
            code: "SCOPE_VIOLATION",
            message: "Tenant actor requires x-tenant-id and x-user-id",
          },
          HttpStatus.FORBIDDEN
        );
      }

      return {
        kind: "tenant",
        scope: "tenant",
        tenantId,
        userId,
      };
    }

    if (kind === "platform") {
      if (!userId) {
        throw new HttpException(
          {
            code: "SCOPE_VIOLATION",
            message: "Platform actor requires x-user-id",
          },
          HttpStatus.FORBIDDEN
        );
      }

      return {
        kind: "platform",
        scope: "platform",
        userId,
      };
    }

    if (kind === "customer") {
      return {
        kind: "customer",
        scope: "customer",
      };
    }

    if (kind === "anonymous") {
      return {
        kind: "anonymous",
        scope: "customer",
      };
    }

    throw new HttpException(
      {
        code: "VALIDATION_ERROR",
        message: `Unknown actor kind: ${kindHeader}`,
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
