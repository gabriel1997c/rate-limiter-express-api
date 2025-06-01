import { DataStore } from './types';

interface ValueWithTTL<T> {
  value: T;
  expiresAt: number | null;
}

export class InMemoryDataStore<T> implements DataStore<T> {
  private store: Map<string, ValueWithTTL<T>> = new Map();

  async get(key: string): Promise<T | undefined> {
    const entry = this.store.get(key);
    if (!entry) {
      return undefined;
    }

    if (typeof entry.expiresAt === 'number' && Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return undefined;
    }

    return entry.value;
  }

  async set(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const expiresAt = ttlSeconds ? Date.now() + ttlSeconds * 1000 : null;
    this.store.set(key, { value, expiresAt });
  }
}
