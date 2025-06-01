import { ClientId, Endpoint } from '../../../types';
import { DataStore } from '../../storage';

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  used: number;
  reset: number;
  retryAfter: number;
  resource: string;
}

export interface RateLimiter {
  allow(clientId: ClientId, endpoint: Endpoint): Promise<RateLimitResult>;
}

export abstract class BaseRateLimiter<RateLimiterConfig, State> implements RateLimiter {
  protected config: RateLimiterConfig;
  protected store: DataStore<State>;
  protected abstract algorithm: string;

  constructor(config: RateLimiterConfig, store: DataStore<State>) {
    this.config = config;
    this.store = store;
  }

  protected getKey(clientId: ClientId, endpoint: Endpoint): string {
    return `${clientId}:${endpoint}:${this.algorithm}`;
  }

  protected async saveState(key: string, state: State): Promise<void> {
    await this.store.set(key, state);
  }

  abstract allow(clientId: ClientId, endpoint: Endpoint): Promise<RateLimitResult>;
}
