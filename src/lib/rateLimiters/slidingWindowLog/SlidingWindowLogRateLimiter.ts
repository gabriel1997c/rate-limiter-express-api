import { RateLimitResult, BaseRateLimiter } from '../shared';
import { SlidingWindowLogConfig, SlidingWindowLogState } from './types';
import { ClientId, Endpoint, ClientIdEndpointAlgorithmKey } from '../../../types';
import { getRateLimitTtlMargin, isTtlEnabled } from '../../../shared/utils';

export class SlidingWindowLogRateLimiter extends BaseRateLimiter<SlidingWindowLogConfig, SlidingWindowLogState> {
  protected algorithm = 'sliding-window-log';

  async allow(clientId: ClientId, endpoint: Endpoint): Promise<RateLimitResult> {
    const key = this.getKey(clientId, endpoint) as ClientIdEndpointAlgorithmKey;
    const now = Date.now();
    const windowStart = now - this.config.windowMs;

    const state = await this.loadState(key, windowStart);
    const allowed = this.isAllowed(state);

    if (allowed) {
      state.timestamps.push(now);
      const ttlSeconds = isTtlEnabled() ? Math.ceil(this.config.windowMs / 1000) + getRateLimitTtlMargin() : undefined;

      await this.saveState(key, state, ttlSeconds);
    }

    return this.buildResult(key, allowed, state, now);
  }

  private buildResult(key: string, allowed: boolean, state: SlidingWindowLogState, now: number): RateLimitResult {
    const limit = this.config.limit;
    const used = state.timestamps.length;
    const remaining = allowed ? limit - used : 0;

    const oldest = state.timestamps[0] ?? now;
    const resetMs = oldest + this.config.windowMs;
    const resetSeconds = Math.ceil(resetMs / 1000);
    const retryAfterSeconds = Math.max(0, resetSeconds - Math.floor(now / 1000));

    return {
      allowed,
      limit,
      used,
      remaining,
      reset: resetSeconds,
      retryAfter: retryAfterSeconds,
      resource: key,
    };
  }

  private isValidState(state: any): state is SlidingWindowLogState {
    return (
      state &&
      Array.isArray(state.timestamps) &&
      state.timestamps.every((timestamp: unknown) => typeof timestamp === 'number' && !Number.isNaN(timestamp))
    );
  }

  protected initializeState(): SlidingWindowLogState {
    return { timestamps: [] };
  }

  private async loadState(key: string, windowStart: number): Promise<SlidingWindowLogState> {
    const state = await this.store.get(key);

    if (!this.isValidState(state)) {
      return this.initializeState();
    }

    state.timestamps = state.timestamps.filter((ts) => ts >= windowStart);
    return state;
  }

  private isAllowed(state: SlidingWindowLogState): boolean {
    return state.timestamps.length < this.config.limit;
  }
}
