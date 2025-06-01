export interface SlidingWindowLogConfig {
  windowMs: number;
  limit: number;
}

export interface SlidingWindowLogState {
  timestamps: number[];
}
