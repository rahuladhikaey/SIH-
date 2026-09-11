import { createApp } from './app';
import { config, validateConfig } from './config';
import { connectDB } from './utils/db';
import { logger } from './utils/logger';
import { initializeAIJobWorker } from './queue/aiJob.queue';

const startServer = async () => {
  try {
    validateConfig();
    await connectDB();
    initializeAIJobWorker();

    const app = createApp();
    const server = app.listen(config.port, () => {
      logger.info(`🚀 MedMitra Backend Server listening on http://localhost:${config.port}`);
      logger.info(`📚 Swagger OpenAPI Documentation available at http://localhost:${config.port}/api-docs`);
    });

    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP Server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error: any) {
    logger.error(`Fatal error starting server: ${error.message}`);
    process.exit(1);
  }
};

if (require.main === module) {
  startServer();
}
