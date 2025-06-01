import { CLIENT_IDS, ENDPOINTS, ALGORITHMS } from '../constants';
import { SlidingWindowLogConfig, TokenBucketConfig } from '../lib/rateLimiters';

export type ClientId = (typeof CLIENT_IDS)[number];
export type Endpoint = (typeof ENDPOINTS)[number];
export type RateLimiterType = (typeof ALGORITHMS)[number];

export type ClientIdEndpointKey = `${ClientId}:${Endpoint}`;
export type ClientIdEndpointAlgorithmKey = `${ClientId}:${Endpoint}:${RateLimiterType}`;

export type RateLimiterConfig = SlidingWindowLogConfig | TokenBucketConfig;

export type RateLimiterDefinition =
  | { type: 'sliding-window-log'; options: SlidingWindowLogConfig }
  | { type: 'token-bucket'; options: TokenBucketConfig };

export type ClientsEndpointsAlgorithmsConfig = {
  [client in ClientId]?: {
    [endpoint in Endpoint]?: RateLimiterDefinition;
  };
};
