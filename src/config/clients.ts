import { MS_PER_SECOND } from '../constants';
import { ClientsEndpointsAlgorithmsConfig } from '../types';
import { ConfigBuilder } from './configBuilder';

export const config: ClientsEndpointsAlgorithmsConfig = new ConfigBuilder()
  .set('client-1', 'bar', 'token-bucket', {
    capacity: 3,
    tokenRegenerationRate: 1 / MS_PER_SECOND,
  })
  .set('client-1', 'foo', 'sliding-window-log', {
    windowMs: 5 * MS_PER_SECOND,
    limit: 2,
  })
  .set('client-2', 'bar', 'token-bucket', {
    capacity: 2,
    tokenRegenerationRate: 0.5 / MS_PER_SECOND,
  })
  .set('client-2', 'foo', 'sliding-window-log', {
    windowMs: 10 * MS_PER_SECOND,
    limit: 3,
  })
  .build();
