import { config } from '../config';
import { RateLimitedRouterFactory } from '../lib/factories';
import { DataStore } from '../lib/storage';

export function setupBarRouter(store: DataStore<unknown>) {
  const factory = new RateLimitedRouterFactory(store);
  return factory.createRouter('bar', config);
}
