import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * NestJS-managed Prisma client.
 *
 * @remarks
 * Prisma uses a connection pool under the hood. This service exists so Nest can
 * control lifecycle (connect/disconnect) and so we can depend-inject the client.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   * Initializes the Prisma connection when the Nest module starts.
   */
  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  /**
   * Closes Prisma connections when Nest shuts down.
   */
  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
