import { CLIENT_IDS, ENDPOINTS } from '../../constants';
import { StoreType } from '../../lib/factories';
import { Endpoint, ClientId } from '../../types';

export const isValidClientId = (value: string): value is ClientId => {
  return (CLIENT_IDS as readonly string[]).includes(value);
};

export const isValidEndpoint = (value: string): value is Endpoint => {
  return (ENDPOINTS as readonly string[]).includes(value);
};

export function getStoreType(value: string | undefined): StoreType {
  if (value === 'redis') {
    return value;
  }
  return 'memory';
}
