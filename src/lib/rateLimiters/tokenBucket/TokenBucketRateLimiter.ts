import { ClientId, ClientIdEndpointAlgorithmKey, Endpoint } from '../../../types';
import { RateLimitResult, BaseRateLimiter } from '../shared';
import { TokenBucketConfig, TokenBucketState } from './types';

export class TokenBucketRateLimiter extends BaseRateLimiter<TokenBucketConfig, TokenBucketState> {
  protected algorithm = 'token-bucket';

  async allow(clientId: ClientId, endpoint: Endpoint): Promise<RateLimitResult> {
    const key = this.getKey(clientId, endpoint) as ClientIdEndpointAlgorithmKey;
    const now = Date.now();

    const state = await this.loadState(key, now);
    this.recalculateTokens(state, now);

    const allowed = this.consumeToken(state);
    await this.saveState(key, state);

    const limit = this.config.capacity;
    const remaining = Math.floor(state.tokens);
    const used = Math.ceil(limit - state.tokens);

    let retryAfterMs = 0;
    let resetMs = now;

    if (state.tokens < 1) {
      const tokensNeeded = 1 - state.tokens;
      const nextAvailableMs = tokensNeeded / this.config.tokenRegenerationRate;

      resetMs = state.lastTokenCalcTime + nextAvailableMs;
      retryAfterMs = Math.max(0, resetMs - now);
    }

    const resetSeconds = Math.ceil(resetMs / 1000);
    const retryAfterSeconds = Math.ceil(retryAfterMs / 1000);

    return {
      allowed,
      limit,
      remaining,
      used,
      reset: resetSeconds,
      retryAfter: retryAfterSeconds,
      resource: key,
    };
  }

  protected initializeState(now: number): TokenBucketState {
    return {
      lastTokenCalcTime: now,
      tokens: this.config.capacity,
    };
  }

  private async loadState(key: string, now: number): Promise<TokenBucketState> {
    const state = await this.store.get(key);

    if (!state || typeof state.tokens !== 'number' || Number.isNaN(state.tokens) || typeof state.lastTokenCalcTime !== 'number') {
      return this.initializeState(now);
    }

    return state;
  }

  private recalculateTokens(state: TokenBucketState, now: number): void {
    const elapsed = now - state.lastTokenCalcTime;
    const regeneratedTokens = elapsed * this.config.tokenRegenerationRate;
    state.tokens = Math.min(this.config.capacity, state.tokens + regeneratedTokens);
    state.lastTokenCalcTime = now;
  }

  private consumeToken(state: TokenBucketState): boolean {
    if (state.tokens >= 1) {
      state.tokens -= 1;
      return true;
    }
    return false;
  }
}
