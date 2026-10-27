import type { Server } from 'http';
import { createApp } from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { env } from './config/env.js';
import { logger } from './config/logger.js';

async function bootstrap(): Promise<void> {
  await connectDB();

  const app = createApp();
  const server: Server = app.listen(env.PORT, () => {
    logger.info(`🚀 Kenlivo API listening on port ${env.PORT} (${env.NODE_ENV})`);
    logger.info(`   Base path: ${env.API_PREFIX}`);
  });

  const shutdown = async (signal: string) => {
    logger.warn(`${signal} received — shutting down gracefully`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
    // Force-exit if close hangs.
    setTimeout(() => process.exit(1), 10_000).unref();
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
  process.on('unhandledRejection', (reason) => {
    logger.error('Unhandled rejection', reason);
  });
}

bootstrap().catch((err) => {
  logger.error('Fatal startup error', err instanceof Error ? err.stack : err);
  process.exit(1);
});
