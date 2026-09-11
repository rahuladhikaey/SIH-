import mongoose from 'mongoose';
import { config } from '../config';

async function check() {
  if (!config.mongoUri) {
    console.log('No MONGODB_URI found');
    return;
  }
  await mongoose.connect(config.mongoUri);
  console.log('Connected to DB');
  const db = mongoose.connection.db;
  if (!db) {
    console.log('No DB');
    return;
  }
  const users = await db.collection('users').find({}).toArray();
  console.log('Registered Users Count:', users.length);
  for (const u of users) {
    console.log(`- Email: "${u.email}", Role: ${u.role}, FullName: "${u.fullName}", Active: ${u.isActive}, CreatedAt: ${u.createdAt}`);
  }
  await mongoose.disconnect();
}

check().catch(console.error);
