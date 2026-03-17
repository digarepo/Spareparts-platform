import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import type { Request, Response } from "express";

import type { ApiError, ApiErrorCode } from "@spareparts/contracts";
import { ApiErrorCodeSchema } from "@spareparts/contracts";

/**
 * Global exception filter that maps server errors into the canonical API error
 * envelope.
 *
 * @remarks
 * This filter is part of the Slice 5 trust-boundary wiring. All errors are
 * returned as client-safe envelopes and must not leak secrets.
 */
@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  /**
   * Handles any thrown error, converting it into a canonical API error response.
   *
   * @param exception - The thrown exception.
   * @param host - Nest execution context.
   */
  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const res = ctx.getResponse<Response>();
    const req = ctx.getRequest<Request>();

    const correlationIdHeader = req.header("x-correlation-id");
    if (correlationIdHeader) {
      res.setHeader("x-correlation-id", correlationIdHeader);
    }

    const { status, apiError } = this.mapException(exception);

    res.status(status).json({ ok: false as const, error: apiError });
  }

  private mapException(exception: unknown): { status: number; apiError: ApiError } {
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const response = exception.getResponse();

      if (typeof response === "object" && response !== null) {
        const maybeCode = (response as { code?: unknown }).code;
        const maybeMessage = (response as { message?: unknown }).message;
        const maybeDetails = (response as { details?: unknown }).details;

        const codeParsed = ApiErrorCodeSchema.safeParse(maybeCode);
        if (codeParsed.success && typeof maybeMessage === "string" && maybeMessage.length > 0) {
          return {
            status,
            apiError: {
              code: codeParsed.data,
              message: maybeMessage,
              details:
                typeof maybeDetails === "object" && maybeDetails !== null
                  ? (maybeDetails as Record<string, unknown>)
                  : undefined,
            },
          };
        }
      }

      return {
        status,
        apiError: {
          code: this.mapStatusToCode(status),
          message: exception.message || "Request failed",
        },
      };
    }

    const message = exception instanceof Error ? exception.message : "Internal error";
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      apiError: {
        code: "INTERNAL",
        message,
      },
    };
  }

  private mapStatusToCode(status: number): ApiErrorCode {
    if (status === HttpStatus.UNAUTHORIZED) return "UNAUTHORIZED";
    if (status === HttpStatus.FORBIDDEN) return "FORBIDDEN";
    if (status === HttpStatus.NOT_FOUND) return "NOT_FOUND";
    if (status === HttpStatus.CONFLICT) return "CONFLICT";
    if (status === HttpStatus.TOO_MANY_REQUESTS) return "RATE_LIMITED";
    if (status === HttpStatus.BAD_REQUEST) return "VALIDATION_ERROR";
    return "INTERNAL";
  }
}
