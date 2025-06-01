export interface DataStore<T> {
  get(key: string): Promise<T | undefined>;
  set(key: string, value: T, ttlSeconds?: number): Promise<void>;
  cleanup?(): Promise<void>;
}
