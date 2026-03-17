
import { Module } from "@nestjs/common";

import { HealthController } from "./health/health.controller";

/**
 * Root NestJS module for the API application.
 *
 * @remarks
 * This module is intentionally minimal. Production wiring (request context,
 * RLS, error mapping, etc.) is composed by importing feature/infrastructure
 * modules as Slice 5 is implemented.
 */
@Module({
  controllers: [HealthController],
  providers: [],
})
export class AppModule {}
