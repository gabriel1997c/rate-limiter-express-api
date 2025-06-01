export function getRateLimitTtlMargin(): number {
  const raw = process.env.RATE_LIMIT_TTL_MARGIN_SECONDS;
  const margin = parseInt(raw ?? '5', 10);
  return Number.isNaN(margin) ? 5 : margin;
}
