import { Controller, Get } from "@nestjs/common";

import type { DbRlsContext } from "@spareparts/db";
import { withRlsTransaction } from "@spareparts/db";
import type { Prisma } from "@prisma/client";

import { getRequestContext } from "../infrastructure/request-context";
import { PrismaService } from "../prisma/prisma.service";

/**
 * Tenancy endpoints used to validate tenant isolation.
 *
 * @remarks
 * This is a Slice 5 proving surface: request context -> DB RLS context -> query.
 */
@Controller("tenancy")
export class TenancyController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Lists the current tenant memberships under RLS enforcement.
   */
  @Get("memberships")
  public async listMemberships(): Promise<{ memberships: Array<{ tenantId: string; userId: string; roleKey: string | null }> }> {
    const ctx = getRequestContext();

    if (ctx.actor.kind === "tenant" && !ctx.tenantId) {
      throw new Error("Invalid tenant request context: tenantId is required for tenant-scoped requests.");
    }

    const rlsCtx: DbRlsContext =
      ctx.actor.kind === "tenant"
        ? {
            actorKind: "tenant",
            tenantId: ctx.tenantId!,
          }
        : {
            actorKind: ctx.actor.kind,
          };

    const memberships = await withRlsTransaction(this.prisma, rlsCtx, async (tx: Prisma.TransactionClient) => {
      return tx.tenantMembership.findMany({
        select: {
          tenantId: true,
          userId: true,
          roleKey: true,
        },
      });
    });

    return { memberships };
  }
}
