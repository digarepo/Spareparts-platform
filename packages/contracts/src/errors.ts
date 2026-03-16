import { z } from 'zod';
/**
 * Cannonical error codes for API responses.
 *
 * @remarks
 *  - keep this list small and stable.
 *  - Add new codes only with explicit review because clients will depend on them.
 */
export const ApiErrorCodeSchema = z.enum([
    'UNAUTHORIZED',
    'FORBIDDEN',
    'SCOPE_VIOLATION',
    'VALIDATION_ERROR',
    'NOT_FOUND',
    'CONFLICT',
    'RATE_LIMITED',
    'INTERNAL'
]);

export type ApiErrorCode = z.infer<typeof ApiErrorCodeSchema>;

/**
 * Standard API error envelope.
 *
 * @remarks
 *  - **Authority:** API boundary
 *  - **Invariants:**
 *      - Errors must be safe to return to clients (no secrets)
 *      - Internal errors must not leak sensitive details.
 */
export const ApiErrorSchema = z.object({
    code: ApiErrorCodeSchema,
    message: z.string().min(1),
    /**
     * optional machine-readable details. Must be safe for clients.
     */
    details: z.record(z.string(), z.unknown()).optional(),
});

export type ApiError = z.infer<typeof ApiErrorSchema>;

/**
 * Standard API response envelope that can represent either success or failure.
 *
 * @typeParam T - success payload type.
 *
 * @remarks
 *  - Prefer this envelope for external HTTP APIs so clients have uniform handling.
 */
export const ApiResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
    z.discriminatedUnion('ok', [
        z.object({
            ok: z.literal(true),
            data: dataSchema,
        }),
        z.object({
            ok: z.literal(false),
            error: ApiResponseSchema
        }),
    ]);

    export type ApiResponse<T> = { ok: true, data: T} | { ok: false, error: ApiError};
