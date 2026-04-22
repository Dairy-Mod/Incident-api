import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { envs } from 'src/config/envs';
import { logger } from 'src/config/logger';

@Injectable()
export class RedisCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly client = new Redis({
    host: envs.REDIS_HOST,
    port: envs.REDIS_PORT,
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

  async onModuleInit(): Promise<void> {
    try {
      await this.client.connect();
      logger.info('[RedisCacheService] Redis connected');
    } catch (error) {
      logger.warn(
        `[RedisCacheService] Redis connection failed, cache disabled temporarily: ${String(error)}`,
      );
    }
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<'OK' | null> {
    if (ttlSeconds) {
      return this.client.set(key, value, 'EX', ttlSeconds);
    }

    return this.client.set(key, value);
  }

  async del(key: string): Promise<number> {
    return this.client.del(key);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client.status !== 'end') {
      await this.client.quit();
    }
  }
}
