import { logger } from '../shared/utils';
import { ClientId, Endpoint, ClientsEndpointsAlgorithmsConfig, RateLimiterDefinition } from '../types';

type TypeToConfig = {
  [K in RateLimiterDefinition as K['type']]: K['options'];
};

export class ConfigBuilder {
  private config: ClientsEndpointsAlgorithmsConfig = {};

  addClient(client: ClientId): this {
    if (!this.config[client]) {
      this.config[client] = {};
    }
    return this;
  }

  set<K extends keyof TypeToConfig>(client: ClientId, endpoint: Endpoint, type: K, options: TypeToConfig[K]): this {
    this.addClient(client);

    if (this.config[client]![endpoint]) {
      logger.warn(`Warning: Algorithm already set for client "${client}" and endpoint "${endpoint}". Overwriting previous config.`);
    }

    this.config[client]![endpoint] = { type, options } as Extract<RateLimiterDefinition, { type: K }>;
    return this;
  }

  build(): ClientsEndpointsAlgorithmsConfig {
    return this.config;
  }
}
