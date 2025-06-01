export function isTtlEnabled(): boolean {
  return process.env.USE_TTL === 'true';
}
