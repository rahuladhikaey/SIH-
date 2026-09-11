import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '5000', 10),
  mongoUri: process.env.MONGODB_URI || '',
  jwtSecret: process.env.JWT_SECRET || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '24h',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
  aiServiceUrl: process.env.AI_SERVICE_URL || 'http://localhost:8000',
  redis: {
    url: process.env.REDIS_URL || undefined,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD || undefined,
  },
  storageProvider: (process.env.STORAGE_PROVIDER || 'gridfs').toLowerCase(),
  awsRegion: process.env.AWS_REGION || 'us-east-1',
  s3BucketName: process.env.S3_BUCKET_NAME || 'medmitra-uploads',
  awsAccessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
  awsSecretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  s3SignedUrlExpires: parseInt(process.env.S3_SIGNED_URL_EXPIRES || '300', 10),
  maxSizeBytes: parseInt(process.env.MAX_FILE_SIZE_BYTES || '10485760', 10),
};

export const validateConfig = () => {
  const missing: string[] = [];

  if (!config.mongoUri) {
    missing.push('MONGODB_URI');
  }
  if (!config.jwtSecret) {
    missing.push('JWT_SECRET');
  }

  if (missing.length > 0) {
    const errorMsg = `CRITICAL FATAL ERROR: Missing mandatory environment variables: ${missing.join(', ')}. System cannot start.`;
    console.error(errorMsg);
    if (config.env !== 'test') {
      throw new Error(errorMsg);
    }
  }
};
