import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AuthContext, AuthContextManager } from '../../prisma/auth-context.extension';
import type { Request } from 'express';

/**
 * Interceptor that automatically sets auth context for all database operations.
 *
 * @remarks
 * - **Scope:** platform
 * - **Authority:** Request-level context management
 * - **Invariants:** Ensures RLS context is available for all operations
 * - **Threading/Async:** Uses AsyncLocalStorage for request isolation
 * - **Side effects:** Sets database context for RLS policies
 * - **Tenancy:** Enforces tenant isolation at database level
 *
 * @example
 * ```typescript
 * @UseInterceptors(AuthContextInterceptor)
 * @Get('products')
 * async getProducts() {
 *   // All Prisma operations here will have RLS context automatically
 *   return await this.prisma.product.findMany();
 * }
 * ```
 */
@Injectable()
export class AuthContextInterceptor implements NestInterceptor {
  /**
   * Intercepts request to set auth context.
   *
   * @param context - NestJS execution context
   * @param next - Next handler in the chain
   * @returns Observable with auth context set
   *
   * @remarks
   * - Extracts auth context from request.auth
   * - Sets context using AuthContextManager
   * - Ensures context is available for all database operations
   * - Automatically cleans up when request completes
   */
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest<Request & { auth?: AuthContext }>();
    const authContext = request.auth;

    if (authContext) {
      // Set auth context for this request
      AuthContextManager.setContext(authContext);

      // Ensure context is cleared when request completes
      return new Observable((subscriber) => {
        next.handle().subscribe({
          next: (value) => {
            subscriber.next(value);
          },
          error: (error) => {
            AuthContextManager.clearContext();
            subscriber.error(error);
          },
          complete: () => {
            AuthContextManager.clearContext();
            subscriber.complete();
          },
        });
      });
    }

    // No auth context - proceed normally
    return next.handle();
  }
}
