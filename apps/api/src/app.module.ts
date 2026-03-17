import { MiddlewareConsumer, Module, NestModule } from "@nestjs/common";

import { HealthController } from "./health/health.controller";
import { RequestContextMiddleware } from "./http/request-context.middleware";
import { PrismaModule } from "./prisma/prisma.module";
import { TenancyModule } from "./tenancy/tenancy.module";

/**
 * Root NestJS module for the API application.
 *
 * @remarks
 * This module is intentionally minimal. Production wiring (request context,
 * RLS, error mapping, etc.) is composed by importing feature/infrastructure
 * modules as Slice 5 is implemented.
 */
@Module({
  imports: [PrismaModule, TenancyModule],
  controllers: [HealthController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer): void {
    consumer.apply(RequestContextMiddleware).forRoutes("*");
  }
}
