/**
 * Tenant-scoped Prisma client factory.
 *
 * @remarks
 * - **Scope:** tenant
 * - **Authority:** database session management
 * - **Threading/Async:** returns configured Prisma client
 * - **Tenancy:** injects tenant context into database session
 */

import type { RequestContext } from '@spareparts/contracts';
import { PrismaClient } from '@prisma/client';

/**
 * Creates a Prisma client with tenant-scoped session context.
 *
 * @param ctx - Request context with tenant information
 * @returns Prisma client with tenant session variables set
 *
 * @remarks
 * - Sets app.tenant_id session variable for RLS policies
 * - Sets app.scope session variable for access control
 * - All queries execute within tenant boundary
 * - Client should be scoped to request lifecycle
 */
export function getTenantPrismaClient(ctx: RequestContext): PrismaClient {
  const prisma = new PrismaClient();

  // Set tenant context for Row Level Security
  const tenantSessionSql = `
    SET app.tenant_id = '${ctx.tenantId}';
    SET app.scope = 'tenant';
  `;

  prisma.$executeRawUnsafe(tenantSessionSql);

  return prisma;
}

/**
 * Creates a platform-scoped Prisma client for administrative operations.
 *
 * @returns Prisma client with platform-level access
 *
 * @remarks
 * - Used for tenant management and platform operations
 * - Bypasses tenant RLS policies
 * - Should be used carefully with proper authorization
 */
export function getPlatformPrismaClient(): PrismaClient {
  const prisma = new PrismaClient();

  // Set platform context for administrative operations
  const platformSessionSql = `
    SET app.scope = 'platform';
  `;

  prisma.$executeRawUnsafe(platformSessionSql);

  return prisma;
}
