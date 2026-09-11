import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import routes from './routes';
import { errorHandler } from './middleware/error.middleware';
import { apiRateLimiter, authRateLimiter } from './middleware/rateLimit.middleware';
import { swaggerSpec } from './config/swagger';
import { config } from './config';

export const createApp = (): Application => {
  const app = express();

  // Security headers & CORS
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
    })
  );
  app.use(
    cors({
      origin: (origin, callback) => {
        if (
          !origin ||
          config.frontendUrl === '*' ||
          origin === config.frontendUrl ||
          origin.endsWith('.onrender.com') ||
          origin.includes('localhost')
        ) {
          callback(null, true);
        } else {
          callback(null, true);
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    })
  );

  // Rate Limiting
  app.use('/api/v1/auth', authRateLimiter);
  app.use('/api', apiRateLimiter);

  // Body Parsing
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health Check Endpoint
  app.get('/health', (req: Request, res: Response) => {
    res.status(200).json({
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'MedMitra Backend',
      version: '2.0.0',
    });
  });

  // Swagger Documentation Endpoint
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Mount API Routes
  app.use('/api/v1', routes);

  // Centralized Error Handler
  app.use(errorHandler);

  return app;
};
