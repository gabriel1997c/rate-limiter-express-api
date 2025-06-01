import { MS_PER_SECOND } from '../constants';
import { ClientsEndpointsAlgorithmsConfig } from '../types';
import { ConfigBuilder } from './configBuilder';

export const config: ClientsEndpointsAlgorithmsConfig = new ConfigBuilder()
  .set('client-a', 'foo', 'token-bucket', {
    capacity: 3,
    tokenRegenerationRate: 0.5 / MS_PER_SECOND,
  })
  .set('client-b', 'foo', 'token-bucket', {
    capacity: 5,
    tokenRegenerationRate: 0.2 / MS_PER_SECOND,
  })
  .build();
