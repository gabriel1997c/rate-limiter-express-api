import { Router, Request, Response, NextFunction } from 'express';
import { RateLimiterFactory } from './RateLimiterFactory';
import { ClientsEndpointsAlgorithmsConfig } from '../../types';
import { isValidClientId, isValidEndpoint, logger } from '../../shared/utils';
import { DataStore } from '../storage';

export class RateLimitedRouterFactory {
  private store: DataStore<unknown>;

  constructor(store: DataStore<unknown>) {
    this.store = store;
  }

  createRouter(endpoint: string, config: ClientsEndpointsAlgorithmsConfig): Router {
    const router = Router();

    router.get(`/${endpoint}`, async (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        const clientId = authHeader?.split(' ')[1];

        logger.info(`[${endpoint}] Request: Endpoint - ${endpoint} ; Client Id: ${clientId}`);

        if (!clientId) {
          logger.warn(`[${endpoint}] Missing client ID`);
          res.status(401).json({ error: 'Missing client ID' });
          return;
        }

        if (!isValidClientId(clientId)) {
          logger.warn(`[${endpoint}] Invalid client ID: ${clientId}`);
          res.status(400).json({ error: 'Invalid client' });
          return;
        }

        if (!isValidEndpoint(endpoint)) {
          logger.warn(`[${endpoint}] Invalid endpoint`);
          res.status(400).json({ error: 'Invalid endpoint' });
          return;
        }

        const identifiedConfig = config[clientId]?.[endpoint];

        if (!identifiedConfig) {
          logger.warn(`[${endpoint}] Missing config for client and endpoint`);
          res.status(403).json({ error: 'Missing config for client and endpoint' });
          return;
        }

        const limiter = RateLimiterFactory.create(identifiedConfig, this.store);
        const result = await limiter.allow(clientId, endpoint);

        res.set({
          'X-RateLimit-Limit': result.limit.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Used': result.used.toString(),
          'X-RateLimit-Reset': result.reset.toString(),
          'X-RateLimit-Resource': result.resource,
        });

        if (!result.allowed) {
          logger.info('Rate limit exceeded');
          res.set('Retry-After', result.retryAfter.toString());
          res.status(429).json({ error: 'Rate limit exceeded' });
          return;
        }

        logger.info('Request allowed');

        res.status(200).json({ success: true });
        return;
      } catch (err) {
        next(err);
      }
    });

    return router;
  }
}
