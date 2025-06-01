import express from 'express';
import { setupFooRouter } from './routes';
import { errorHandler } from './middleware';
import { getStoreType } from './shared/utils';
import { DataStoreFactory } from './lib/factories';

export async function createApp() {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  const store = await DataStoreFactory.create<unknown>({
    type: getStoreType(process.env.STORE_TYPE),
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    useTls: process.env.USE_TLS === 'true',
  });

  const fooRouter = setupFooRouter(store);

  app.use(fooRouter);

  app.use(errorHandler);

  return { app, store };
}
