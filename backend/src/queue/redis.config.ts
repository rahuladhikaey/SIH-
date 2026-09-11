import Redis from 'ioredis';
import { config } from '../config';
import { logger } from '../utils/logger';

export const redisConnectionOptions: any = config.redis.url
  ? {
      url: config.redis.url,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      tls: config.redis.url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
    }
  : {
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password || undefined,
      maxRetriesPerRequest: null,
      enableOfflineQueue: false,
      lazyConnect: true,
    };

export const createRedisConnection = () => {
  const client = config.redis.url
    ? new Redis(config.redis.url, {
        maxRetriesPerRequest: null,
        enableOfflineQueue: false,
        tls: config.redis.url.startsWith('rediss://') ? { rejectUnauthorized: false } : undefined,
      })
    : new Redis(redisConnectionOptions);

  client.on('connect', () => {
    logger.info(`Redis client connected successfully.`);
  });

  client.on('error', (err) => {
    logger.warn(`Redis connection warning: ${err.message}`);
  });

  return client;
};
