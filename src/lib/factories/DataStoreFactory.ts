import { logger } from '../../shared/utils';
import { DataStore, InMemoryDataStore, RedisDataStore } from '../storage';

export type StoreType = 'memory' | 'redis';

interface StoreOptions {
  type: StoreType;
  redisHost?: string;
  redisPort?: number;
  useTls?: boolean;
}

export class DataStoreFactory {
  static async create<T>(options: StoreOptions): Promise<DataStore<T>> {
    const { type, redisHost, redisPort, useTls } = options;

    try {
      switch (type) {
        case 'memory':
          logger.debug('Connecting to InMemoryDataStore');
          return new InMemoryDataStore<T>();

        case 'redis': {
          logger.debug('Connecting to RedisDataStore');
          if (!redisHost || !redisPort) {
            throw new Error('Missing Redis URL for redis store');
          }
          const redisStore = new RedisDataStore<T>(redisHost, redisPort, useTls);
          await redisStore.testConnection();
          return redisStore;
        }

        default:
          throw new Error(`Unsupported store type: ${type}`);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      logger.error(`DataStoreFactory: Failed to initialize ${type} store: ${errorMessage}`);
      logger.warn('DataStoreFactory: Falling back to InMemoryDataStore');
      return new InMemoryDataStore<T>();
    }
  }
}
