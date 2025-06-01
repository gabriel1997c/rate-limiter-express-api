import { config } from '../config';
import { RateLimitedRouterFactory } from '../lib/factories';
import { DataStore } from '../lib/storage';

export function setupFooRouter(store: DataStore<unknown>) {
  const factory = new RateLimitedRouterFactory(store);
  return factory.createRouter('foo', config);
}
