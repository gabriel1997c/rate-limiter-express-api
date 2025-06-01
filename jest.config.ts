import type { Config } from 'jest';

const config: Config = {
  verbose: true,
  rootDir: '.',
  testMatch: ['<rootDir>/tests/**/*.test.ts'],
};

export default config;
