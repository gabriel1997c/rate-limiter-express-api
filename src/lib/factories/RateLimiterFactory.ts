import { TokenBucketRateLimiter, TokenBucketState, RateLimiter, SlidingWindowLogRateLimiter, SlidingWindowLogState } from '../rateLimiters';
import { DataStore } from '../storage';
import { RateLimiterDefinition } from '../../types';

export class RateLimiterFactory {
  static create(config: RateLimiterDefinition, store: DataStore<unknown>): RateLimiter {
    switch (config.type) {
      case 'token-bucket':
        return new TokenBucketRateLimiter(config.options, store as DataStore<TokenBucketState>);
      case 'sliding-window-log':
        return new SlidingWindowLogRateLimiter(config.options, store as DataStore<SlidingWindowLogState>);
      default:
        throw new Error(`Unsupported rate limiter type: ${(config as any).type}`);
    }
  }
}
