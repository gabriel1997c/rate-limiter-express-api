import express from 'express';
import { setupBarRouter } from './routes/bar';
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

  app.get('/', (_req, res) => {
    res.status(200).json({ message: 'Please use the /bar and /foo endpoints!' });
  });

  const store = await DataStoreFactory.create<unknown>({
    type: getStoreType(process.env.STORE_TYPE),
    redisHost: process.env.REDIS_HOST,
    redisPort: process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379,
    redisUsername: process.env.REDIS_USERNAME ? process.env.REDIS_USERNAME : 'default',
    redisPassword: process.env.REDIS_PASSWORD,
    useTls: process.env.USE_TLS === 'true',
  });

  const barRouter = setupBarRouter(store);
  const fooRouter = setupFooRouter(store);

  app.use(barRouter);
  app.use(fooRouter);

  app.use(errorHandler);

  return { app, store };
}
