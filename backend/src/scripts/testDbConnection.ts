import mongoose from 'mongoose';
import { config } from '../config';

const atlasUri = config.mongoUri;
const localUri = 'mongodb://127.0.0.1:27017/medmitra';

async function testConnections() {
  console.log('Testing Configured MONGODB_URI from .env:', atlasUri);
  try {
    const connAtlas = await mongoose.connect(atlasUri || '', { serverSelectionTimeoutMS: 4000 });
    console.log('✅ Connected to Configured MongoDB successfully! Host:', connAtlas.connection.host);
    await mongoose.disconnect();
  } catch (err: any) {
    console.log('❌ Failed to connect to Configured MONGODB_URI:', err.message);
  }

  console.log('\nTesting Local MongoDB URI:', localUri);
  try {
    const connLocal = await mongoose.connect(localUri, { serverSelectionTimeoutMS: 3000 });
    console.log('✅ Connected to Local MongoDB successfully! Host:', connLocal.connection.host);
    await mongoose.disconnect();
  } catch (err: any) {
    console.log('❌ Failed to connect to Local MongoDB:', err.message);
  }
}

testConnections();
