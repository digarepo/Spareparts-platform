import { NestFactory } from "@nestjs/core";
import { ApiExceptionFilter } from "./http/api-exception.filter";
import { AppModule } from "./app.module";

/**
 * Bootstraps the API application.
 *
 * @remarks
 * This is the authoritative backend entrypoint. Trust-boundary concerns
 * (request context extraction, RLS binding, fail-closed semantics) are wired
 * through Nest modules and middleware.
 */
async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new ApiExceptionFilter());

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
}

void bootstrap();
