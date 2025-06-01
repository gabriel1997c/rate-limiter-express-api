import dotenv from 'dotenv';
dotenv.config();

import { createApp } from './app';
import { setServer, shutdown } from './lib/server';
import { logger } from './shared/utils';

const PORT = process.env.PORT || 3000;

async function startServer() {
  logger.info('Creating app...');
  const { app, store } = await createApp();

  const server = app.listen(PORT, () => {
    setServer(server);
    logger.info(`Server running on http://localhost:${PORT}`);
  });

  const gracefulShutdown = () => shutdown(store);

  process.on('SIGINT', gracefulShutdown);
  process.on('SIGTERM', gracefulShutdown);
}

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});
