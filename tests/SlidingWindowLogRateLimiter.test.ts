import { SlidingWindowLogConfig, SlidingWindowLogRateLimiter } from '../src/lib/rateLimiters';

describe('SlidingWindowLogRateLimiter', () => {
  const clientId = 'client-1';
  const endpoint = 'foo';
  const algorithm = 'sliding-window-log';
  const key = `${clientId}:${endpoint}:${algorithm}`;
  const limit = 3;
  const windowMs = 10000;
  const envVarMargin = 5;
  const ttlSeconds = Math.ceil(windowMs / 1000) + envVarMargin;

  let store: { get: jest.Mock; set: jest.Mock };
  let config: SlidingWindowLogConfig;
  let limiter: SlidingWindowLogRateLimiter;

  beforeAll(() => {
    process.env.RATE_LIMIT_TTL_MARGIN_SECONDS = `${envVarMargin}`;
  });

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date(0));

    store = {
      get: jest.fn(),
      set: jest.fn(),
    };

    config = { limit, windowMs };
    limiter = new SlidingWindowLogRateLimiter(config, store);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should allow requests when the log is not filled up to the window limit', async () => {
    store.get.mockResolvedValue(null);

    const result = await limiter.allow(clientId, endpoint);

    expect(store.set).toHaveBeenCalledWith(
      key,
      expect.objectContaining({
        timestamps: [0],
      }),
      ttlSeconds,
    );

    expect(result.allowed).toBe(true);
    expect(result.limit).toBe(limit);
    expect(result.used).toBe(1);
    expect(result.remaining).toBe(limit - 1);
    expect(result.resource).toBe(key);
  });

  it('should reject requests when the log is filled up to the window limit', async () => {
    store.get.mockResolvedValue({
      timestamps: [0, 1000, 2000],
    });

    const result = await limiter.allow(clientId, endpoint);

    expect(store.set).not.toHaveBeenCalled();

    expect(result.allowed).toBe(false);
    expect(result.limit).toBe(limit);
    expect(result.used).toBe(limit);
    expect(result.remaining).toBe(0);
    expect(result.resource).toBe(key);
  });

  it('should clean up up old timestamps outside the window and add new timestamp for the allowed request', async () => {
    jest.setSystemTime(15000);

    store.get.mockResolvedValue({
      timestamps: [2000, 7000, 14000],
    });

    const result = await limiter.allow(clientId, endpoint);

    expect(store.set).toHaveBeenCalledWith(
      key,
      expect.objectContaining({
        timestamps: [7000, 14000, 15000],
      }),
      ttlSeconds,
    );

    expect(result.allowed).toBe(true);
    expect(result.used).toBe(3);
    expect(result.remaining).toBe(limit - 3);
    expect(result.resource).toBe(key);
  });

  it('should calculate reset and retryAfter times correctly', async () => {
    jest.setSystemTime(12000);

    store.get.mockResolvedValue({
      timestamps: [4000, 6000],
    });

    const result = await limiter.allow(clientId, endpoint);

    expect(store.set).toHaveBeenCalledWith(
      key,
      expect.objectContaining({
        timestamps: [4000, 6000, 12000],
      }),
      ttlSeconds,
    );

    expect(result.limit).toBe(limit);
    expect(result.used).toBe(limit);
    expect(result.remaining).toBe(0);
    expect(result.resource).toBe(key);

    expect(result.reset).toBe(14);
    expect(result.retryAfter).toBe(2);
  });
});
