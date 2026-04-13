import { Injectable, Logger, Inject } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Idempotency operation states for atomic processing.
 */
export enum IdempotencyState {
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
}

/**
 * Idempotency result interface for type-safe storage.
 */
export interface IdempotencyResult<T = unknown> {
  state: IdempotencyState;
  data?: T;
  error?: string;
  timestamp: number;
}

/**
 * Production-ready Idempotency Service with Redis atomic operations.
 *
 * @remarks
 * - **Scope:** Idempotency key management for checkout operations
 * - **Authority:** Prevents duplicate order creation and payment processing
 * - **Invariants:** Atomic operations, race condition prevention, result replay
 * - **Security:** Prevents duplicate charges, ensures operation consistency
 *
 * Features:
 * - Redis-based with ioredis client
 * - Atomic SET NX EX operations (no race conditions)
 * - Processing state management
 * - Result serialization/deserialization
 * - Comprehensive error handling with fail-closed design
 */
@Injectable()
export class IdempotencyService {
  private readonly logger = new Logger(IdempotencyService.name);
  private readonly defaultTTL: number = 24 * 60 * 60; // 24 hours default
  private readonly processingTTL: number = 5 * 60; // 5 minutes for processing state

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {
    this.logger.log('IdempotencyService initialized with Redis client');
  }

  /**
   * Generate a standardized idempotency key with specific operation.
   *
   * @param customerId - Customer identifier
   * @param cartId - Cart identifier
   * @param operation - Operation type (e.g., 'order_create', 'payment_process')
   * @returns string Generated key
   */
  generateKey(customerId: string, cartId: string, operation: string): string {
    return `idempotency:${operation}:${customerId}:${cartId}`;
  }

  /**
   * Atomically check and mark key as processing (prevents race conditions).
   *
   * @param key - Idempotency key to check and mark
   * @returns Promise<{ isNew: boolean; result?: IdempotencyResult }> Whether key was new and any existing result
   */
  async checkAndMarkProcessing(key: string): Promise<{ isNew: boolean; result?: IdempotencyResult }> {
    try {
      // Atomic operation: SET key processing_state NX EX ttl
      // This prevents race conditions - only one request can set the key
      const processingResult: IdempotencyResult = {
        state: IdempotencyState.PROCESSING,
        timestamp: Date.now(),
      };

      const setResult = await this.redis.set(
        key,
        JSON.stringify(processingResult),
        'EX',
        this.processingTTL,
        'NX' // Only set if key doesn't exist
      );

      if (setResult === 'OK') {
        this.logger.debug(`Idempotency key marked as processing: ${key}`);
        return { isNew: true };
      }

      // Key already exists - get the current state
      const existingValue = await this.redis.get(key);
      if (existingValue) {
        try {
          const result: IdempotencyResult = JSON.parse(existingValue);
          this.logger.debug(`Idempotency key already exists: ${key}, state: ${result.state}`);
          return { isNew: false, result };
        } catch (parseError) {
          this.logger.error(`Failed to parse existing idempotency result: ${key}`, {
            error: parseError instanceof Error ? parseError.message : String(parseError),
          });
          // Treat as failed state if we can't parse
          return { isNew: false, result: { state: IdempotencyState.FAILED, error: 'Corrupted result', timestamp: Date.now() } };
        }
      }

      // Should not happen, but fail closed
      this.logger.warn(`Unexpected state for idempotency key: ${key}`);
      return { isNew: false, result: { state: IdempotencyState.FAILED, error: 'Unexpected state', timestamp: Date.now() } };
    } catch (error) {
      this.logger.error(`Failed to check and mark idempotency key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      // Fail closed - if Redis is down, we don't want to allow duplicate processing
      return { isNew: false, result: { state: IdempotencyState.FAILED, error: 'Redis unavailable', timestamp: Date.now() } };
    }
  }

  /**
   * Save successful result for an idempotency key.
   *
   * @param key - Idempotency key to update
   * @param result - Successful operation result
   * @returns Promise<void>
   */
  async saveSuccessResult<T>(key: string, result: T): Promise<void> {
    try {
      const successResult: IdempotencyResult<T> = {
        state: IdempotencyState.SUCCESS,
        data: result,
        timestamp: Date.now(),
      };

      await this.redis.setex(key, this.defaultTTL, JSON.stringify(successResult));
      this.logger.debug(`Saved success result for idempotency key: ${key}`);
    } catch (error) {
      this.logger.error(`Failed to save success result for idempotency key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      // Don't throw - the operation succeeded, we just failed to cache it
      // This is acceptable as the operation completed successfully
    }
  }

  /**
   * Save failed result for an idempotency key.
   *
   * @param key - Idempotency key to update
   * @param error - Error message or object
   * @returns Promise<void>
   */
  async saveFailureResult(key: string, error: string | Error): Promise<void> {
    try {
      const errorMessage = error instanceof Error ? error.message : error;
      const failureResult: IdempotencyResult = {
        state: IdempotencyState.FAILED,
        error: errorMessage,
        timestamp: Date.now(),
      };

      // Store failures for shorter TTL to allow retry after some time
      await this.redis.setex(key, 60 * 60, JSON.stringify(failureResult)); // 1 hour for failures
      this.logger.debug(`Saved failure result for idempotency key: ${key}`, { error: errorMessage });
    } catch (redisError) {
      this.logger.error(`Failed to save failure result for idempotency key: ${key}`, {
        error: redisError instanceof Error ? redisError.message : String(redisError),
      });
    }
  }

  /**
   * Get stored result for an idempotency key.
   *
   * @param key - Idempotency key to retrieve
   * @returns Promise<IdempotencyResult | null> Stored result or null
   */
  async getResult(key: string): Promise<IdempotencyResult | null> {
    try {
      const value = await this.redis.get(key);
      if (!value) {
        return null;
      }

      const result: IdempotencyResult = JSON.parse(value);
      return result;
    } catch (error) {
      this.logger.error(`Failed to retrieve idempotency key result: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      return null;
    }
  }

  /**
   * Check if a key is currently being processed.
   *
   * @param key - Idempotency key to check
   * @returns Promise<boolean> True if key is in processing state
   */
  async isProcessing(key: string): Promise<boolean> {
    try {
      const result = await this.getResult(key);
      return result?.state === IdempotencyState.PROCESSING;
    } catch (error) {
      this.logger.error(`Failed to check processing state for key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      // Fail closed - assume it's processing to prevent duplicates
      return true;
    }
  }

  /**
   * Delete an idempotency key (for cleanup or testing).
   *
   * @param key - Idempotency key to delete
   * @returns Promise<boolean> True if key was deleted
   */
  async deleteKey(key: string): Promise<boolean> {
    try {
      const result = await this.redis.del(key);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to delete idempotency key: ${key}`, {
        error: error instanceof Error ? error.message : String(error),
      });

      return false;
    }
  }
}
