import { TokenBucketConfig, TokenBucketRateLimiter } from '../src/lib/rateLimiters';

describe('TokenBucketRateLimiter', () => {
  const clientId = 'client-1';
  const endpoint = 'foo';
  const algorithm = 'token-bucket';
  const key = `${clientId}:${endpoint}:${algorithm}`;
  const capacity = 5;
  const tokenRegenerationRate = 0.001;
  const envVarMargin = 5;
  const ttlSeconds = capacity / tokenRegenerationRate / 1000 + envVarMargin;

  let store: { get: jest.Mock; set: jest.Mock };
  let config: TokenBucketConfig;
  let limiter: TokenBucketRateLimiter;

  beforeAll(() => {
    process.env.RATE_LIMIT_TTL_MARGIN_SECONDS = `${envVarMargin}`;
  });

  beforeEach(() => {
    process.env.USE_TTL = 'true';
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));

    store = {
      get: jest.fn(),
      set: jest.fn(),
    };

    config = { capacity, tokenRegenerationRate };
    limiter = new TokenBucketRateLimiter(config, store);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should not apply TTL on store.set when USE_TTL is false', async () => {
    process.env.USE_TTL = 'false';

    store.get.mockResolvedValue(null);

    const result = await limiter.allow(clientId, endpoint);

    const expectedRemainingTokens = capacity - 1;

    expect(store.set).toHaveBeenCalledWith(
      key,
      expect.objectContaining({
        tokens: expectedRemainingTokens,
      }),
      undefined,
    );

    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(expectedRemainingTokens);
  });

  it('should allow a request when tokens are available', async () => {
    store.get.mockResolvedValue(null);

    const result = await limiter.allow(clientId, endpoint);
    const expectedRemainingTokens = capacity - 1;
    expect(store.set).toHaveBeenCalledWith(
      key,
      expect.objectContaining({
        tokens: expectedRemainingTokens,
      }),
      ttlSeconds,
    );

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(capacity);
    expect(result.used).toBe(1);
    expect(result.remaining).toBe(expectedRemainingTokens);
    expect(result.reset).toBeGreaterThanOrEqual(0);
    expect(result.retryAfter).toBe(0);
    expect(result.resource).toBe(key);
  });

  it('should regenerate tokens based on elapsed time', async () => {
    store.get.mockResolvedValue({
      tokens: 2,
      lastTokenCalcTime: 0,
    });

    jest.setSystemTime(3000);

    const result = await limiter.allow(clientId, endpoint);

    expect(store.set).toHaveBeenCalledWith(
      key,
      expect.objectContaining({
        tokens: 4,
        lastTokenCalcTime: 3000,
      }),
      ttlSeconds,
    );

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(capacity);
    expect(result.used).toBe(1);
    expect(result.remaining).toBe(4);
    expect(result.reset).toBeGreaterThanOrEqual(0);
    expect(result.retryAfter).toBe(0);
    expect(result.resource).toBe(key);
  });

  it('should reject request when no tokens are available and calculate retryAfter correctly', async () => {
    store.get.mockResolvedValue({
      tokens: 0.5,
      lastTokenCalcTime: 0,
    });

    jest.setSystemTime(0);

    const result = await limiter.allow(clientId, endpoint);

    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(capacity);
    expect(result.used).toBe(5);
    expect(result.remaining).toBe(0);
    expect(result.reset).toBe(Math.ceil(500 / 1000));
    expect(result.retryAfter).toBe(Math.ceil(500 / 1000));
    expect(result.resource).toBe(key);
  });

  it('should consume token when exactly 1 token is available', async () => {
    store.get.mockResolvedValue({
      tokens: 1,
      lastTokenCalcTime: 0,
    });

    const result = await limiter.allow(clientId, endpoint);

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(capacity);
    expect(result.used).toBe(5);
    expect(result.remaining).toBe(0);
    expect(result.resource).toBe(key);
  });

  it('should update lastTokenCalcTime value after an allow method call', async () => {
    store.get.mockResolvedValue({
      tokens: capacity,
      lastTokenCalcTime: 0,
    });

    jest.setSystemTime(2000);

    await limiter.allow(clientId, endpoint);

    expect(store.set).toHaveBeenCalledWith(
      key,
      expect.objectContaining({
        lastTokenCalcTime: 2000,
      }),
      ttlSeconds,
    );
  });
});
