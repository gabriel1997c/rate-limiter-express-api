import { logger } from '../../shared/utils';
import { DataStore } from './types';
import Redis from 'ioredis';

export class RedisDataStore<T> implements DataStore<T> {
  private readonly client: Redis;

  constructor(redisHost: string, redisPort: number, useTls: boolean = false) {
    this.client = new Redis({
      host: redisHost,
      port: redisPort,
      ...(useTls ? { tls: {} } : {}),
      lazyConnect: true,
    });

    this.client.on('error', (err) => {
      logger.error(`RedisDataStore: Redis connection error: ${err.message}`);
    });
  }

  async testConnection(): Promise<void> {
    try {
      await this.client.connect();
      await this.client.ping();
      logger.info('RedisDataStore: Redis connection successful');
    } catch (err) {
      this.client.disconnect();
      throw err;
    }
  }

  async get(key: string): Promise<T | undefined> {
    const value = await this.client.get(key);
    if (!value) {
      return undefined;
    }
    try {
      return JSON.parse(value) as T;
    } catch (err) {
      logger.error(`RedisDataStore: Failed to parse value for key "${key}": ${err}`);
      return undefined;
    }
  }

  async set(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      await this.client.set(key, serialized);
      logger.debug(`RedisDataStore: Set key "${key}" in Redis with serialized value: ${serialized}`);
    } catch (err) {
      logger.error(`RedisDataStore: Failed to set key "${key}": ${err}`);
    }
  }

  async cleanup(): Promise<void> {
    await this.client.quit();
  }
}
