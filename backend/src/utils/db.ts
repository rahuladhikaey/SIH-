import mongoose from 'mongoose';
import { config } from '../config';
import { logger } from './logger';

import { syncMissingProfiles } from './syncProfiles';

export const connectDB = async (): Promise<typeof mongoose> => {
  if (!config.mongoUri) {
    const err = 'FATAL DATABASE ERROR: MONGODB_URI is missing in environment variables.';
    logger.error(err);
    throw new Error(err);
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 10000,
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    logger.info(`MongoDB Connected successfully to Atlas: ${conn.connection.host}`);
    await syncMissingProfiles();
    return conn;
  } catch (error: any) {
    logger.error(`MONGODB ATLAS CONNECTION FAILED: Could not connect to MongoDB Atlas (${config.mongoUri}). Reason: ${error.message}`);
    logger.warn('IP Whitelist Hint: Ensure 0.0.0.0/0 (Allow access from anywhere) is added under MongoDB Atlas -> Network Access.');
    if (config.env === 'development') {
      try {
        logger.info('Attempting fallback to MongoMemoryServer for development...');
        const mmsPkg = 'mongodb-memory-server';
        const { MongoMemoryServer } = eval('require')(mmsPkg);
        const mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        const conn = await mongoose.connect(uri);
        logger.info(`MongoDB Connected successfully (In-Memory Fallback): ${uri}`);
        await syncMissingProfiles();
        return conn;
      } catch (fallbackErr: any) {
        logger.error(`In-memory MongoDB fallback also failed: ${fallbackErr.message}`);
      }
    }
    throw new Error(`MongoDB Connection Failed: ${error.message}`);
  }
};

export const disconnectDB = async (): Promise<void> => {
  try {
    await mongoose.disconnect();
    logger.info('MongoDB disconnected cleanly');
  } catch (error: any) {
    logger.error(`Error disconnecting MongoDB: ${error.message}`);
  }
};
