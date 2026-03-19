import { Module } from "@nestjs/common";

import { TenancyController } from "./tenancy.controller";

/**
 * Tenancy module.
 */
@Module({
  controllers: [TenancyController],
})
export class TenancyModule {}
