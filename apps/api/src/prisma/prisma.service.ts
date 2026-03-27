import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";
import { withAuthContext, AuthContext } from "./auth-context.extension";

/**
 * Extended Prisma client with auth context capabilities.
 *
 * @remarks
 * - Includes auth context methods
 * - Maintains all original Prisma functionality
 * - Used for type-safe service implementation
 */
interface ExtendedPrismaClient extends PrismaClient {
  $setAuthContext(context: AuthContext): void;
  $getAuthContext(): AuthContext | undefined;
}

/**
 * NestJS-managed Prisma client with RLS context support.
 *
 * @remarks
 * - Wraps PrismaClient with auth context capabilities
 * - Automatically sets database variables for RLS policies
 * - Ensures tenant isolation at database level
 * - Uses AsyncLocalStorage for request-scoped context
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private prisma: PrismaClient;
  private prismaWithAuth!: ExtendedPrismaClient;

  constructor() {
    this.prisma = new PrismaClient();
  }

  /**
   * Initializes the Prisma connection with auth context extension.
   */
  async onModuleInit(): Promise<void> {
    // Apply auth context extension
    this.prismaWithAuth = withAuthContext(this.prisma) as unknown as ExtendedPrismaClient;

    // Connect to database
    await this.prismaWithAuth.$connect();
  }

  /**
   * Closes Prisma connections when Nest shuts down.
   */
  async onModuleDestroy(): Promise<void> {
    await this.prismaWithAuth.$disconnect();
  }

  /**
   * Sets authentication context for subsequent operations.
   *
   * @param context - Authentication context containing user details
   *
   * @remarks
   * - Context is stored in AsyncLocalStorage for request isolation
   * - All subsequent queries will use this context for RLS
   * - Context automatically clears when request completes
   */
  setAuthContext(context: AuthContext): void {
    this.prismaWithAuth.$setAuthContext(context);
  }

  /**
   * Gets current authentication context.
   *
   * @returns Current auth context or undefined
   */
  getAuthContext(): AuthContext | undefined {
    return this.prismaWithAuth.$getAuthContext();
  }

  /**
   * Clean public accessor to the extended Prisma client.
   *
   * @returns Extended Prisma client with auth context capabilities
   *
   * @remarks
   * - Use: this.prisma.db.product.findMany()
   * - Zero maintenance when schema grows
   * - Full type safety and IDE auto-completion
   * - All auth context features preserved
   */
  get db(): ExtendedPrismaClient {
    return this.prismaWithAuth;
  }
}
