import type { Server } from 'http';
import { logger } from '../../shared/utils';

let server: Server | null = null;
let serverRunning = false;
let shuttingDown = false;

export async function closeServer() {
  if (!server || !serverRunning) {
    logger.warn('Server is not running, skipping shutdown.');
    return;
  }

  return new Promise<void>((resolve, reject) => {
    server!.close((err?: Error) => {
      if (err) {
        logger.error('Error closing HTTP server:', err);
        return reject(err);
      }
      logger.info('HTTP server closed');
      resolve();
    });
  });
}

export async function shutdown(store: any) {
  if (shuttingDown) {
    return;
  }
  shuttingDown = true;

  logger.info('Shutting down...');
  await closeServer();

  if (store.cleanup) {
    await store.cleanup();
    logger.info('Data store cleaned up');
  }

  process.exit(0);
}

export function setServer(newServer: Server) {
  server = newServer;
  serverRunning = true;
}
