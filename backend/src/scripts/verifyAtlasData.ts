import mongoose from 'mongoose';
import { config } from '../config';

async function verify() {
  try {
    console.log('Connecting with TLS options...');
    await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 5000,
      tls: true,
      tlsAllowInvalidCertificates: true,
    });
    const db = mongoose.connection.db;
    if (!db) {
      console.log('No DB connected');
      return;
    }
    console.log('✅ Connected to MongoDB Atlas Host:', mongoose.connection.host);
    const users = await db.collection('users').find({}).toArray();
    const doctors = await db.collection('doctors').find({}).toArray();
    const patients = await db.collection('patients').find({}).toArray();

    console.log('\n=== MONGODB ATLAS COLLECTION SUMMARY ===');
    console.log(`- 'users' count: ${users.length}`);
    console.log(`- 'doctors' count: ${doctors.length}`);
    console.log(`- 'patients' count: ${patients.length}`);

    console.log('\n=== PATIENTS ===');
    patients.forEach(p => console.log('Patient:', p.userId, p.dob, p.gender));

    console.log('\n=== DOCTORS ===');
    doctors.forEach(d => console.log('Doctor:', d.userId, d.licenseNumber, d.specialization));

    await mongoose.disconnect();
  } catch (err: any) {
    console.error('❌ Connection Failed:', err.message);
  }
}

verify();
