import { Global, Module } from "@nestjs/common";

import { PrismaService } from "./prisma.service";

/**
 * Global Prisma module.
 *
 * @remarks
 * We mark it global so other modules can inject `PrismaService` without
 * re-importing. This keeps Slice 5 wiring simple.
 */
@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
