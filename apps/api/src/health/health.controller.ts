
import { Controller, Get } from "@nestjs/common";

/**
 * Health endpoint for liveness checks.
 *
 * @remarks
 * This endpoint must remain non-authoritative and side-effect free.
 */
@Controller("health")
export class HealthController {
  /**
   * Liveness check.
   *
   * @returns an object indicating that the service is responding.
   */
  @Get()
  getHealth(): { ok: true } {
    return { ok: true };
  }
}
