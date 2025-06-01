export interface TokenBucketConfig {
  capacity: number;
  tokenRegenerationRate: number;
}

export interface TokenBucketState {
  lastTokenCalcTime: number;
  tokens: number;
}
