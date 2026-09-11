import mongoose from 'mongoose';
import { config } from '../config';

beforeAll(() => {
  config.jwtSecret = 'test_jwt_secret_key_1234567890';
  config.jwtExpiresIn = '24h';
  config.env = 'test';
});

afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
});
