import { Module, Global, Logger } from '@nestjs/common';
import Redis from 'ioredis';

/**
 * Redis Module Configuration.
 *
 * @remarks
 * - **Scope:** Global Redis provider for all modules
 * - **Authority:** Centralized Redis connection management
 * - **Invariants:** Single Redis instance, connection pooling
 * - **Security:** Connection security, error handling
 */
@Global()
@Module({
  providers: [
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => {
        const logger = new Logger('RedisModule');
        const redis = new Redis({
          host: process.env.REDIS_HOST || 'localhost',
          port: parseInt(process.env.REDIS_PORT || '6379', 10),
          password: process.env.REDIS_PASSWORD,
          db: parseInt(process.env.REDIS_DB || '0', 10),
          maxRetriesPerRequest: 3,
          lazyConnect: true,
        });

        redis.on('connect', () => {
          logger.log('Redis connected successfully');
        });

        redis.on('error', (error) => {
          logger.error('Redis connection error', error);
        });

        redis.on('close', () => {
          logger.warn('Redis connection closed');
        });

        return redis;
      },
    },
  ],
  exports: ['REDIS_CLIENT'],
})
export class RedisModule {}
