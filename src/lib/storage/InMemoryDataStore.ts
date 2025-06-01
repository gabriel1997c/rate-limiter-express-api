import { DataStore } from './types';

export class InMemoryDataStore<T> implements DataStore<T> {
  private store: Map<string, T> = new Map();

  async get(key: string): Promise<T | undefined> {
    return this.store.get(key);
  }

  async set(key: string, value: T): Promise<void> {
    this.store.set(key, value);
  }
}
