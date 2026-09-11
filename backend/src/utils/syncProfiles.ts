import { User } from '../models/User';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { logger } from './logger';

/**
 * Ensures all User documents in MongoDB Atlas have corresponding Patient / Doctor profile records.
 */
export async function syncMissingProfiles(): Promise<void> {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      logger.info('[DB Seed] Empty database detected. Seeding default demo accounts...');
      
      const doctorUser = new User({
        email: 'doctor@medmitra.com',
        password: 'Password123',
        role: 'doctor',
        fullName: 'Dr. Sarah Jenkins',
      });
      await doctorUser.save();
      await Doctor.create({
        userId: doctorUser._id,
        licenseNumber: 'MD-123456',
        specialization: 'Cardiology',
      });

      const patientUser = new User({
        email: 'patient@medmitra.com',
        password: 'Password123',
        role: 'patient',
        fullName: 'John Doe',
      });
      await patientUser.save();
      await Patient.create({
        userId: patientUser._id,
        dob: new Date('1990-01-01'),
        gender: 'male',
      });

      logger.info('[DB Seed] Seeded default Doctor (doctor@medmitra.com) & Patient (patient@medmitra.com) accounts.');
    }

    const users = await User.find();
    let patientCreated = 0;
    let doctorCreated = 0;

    for (const u of users) {
      if (u.role === 'patient') {
        const existingPatient = await Patient.findOne({ userId: u._id });
        if (!existingPatient) {
          await Patient.create({
            userId: u._id,
            dob: new Date('1990-01-01'),
            gender: 'other',
          });
          patientCreated++;
        }
      } else if (u.role === 'doctor') {
        const existingDoctor = await Doctor.findOne({ userId: u._id });
        if (!existingDoctor) {
          await Doctor.create({
            userId: u._id,
            licenseNumber: `MD-${u._id.toString().slice(-6).toUpperCase()}`,
            specialization: 'General Medicine',
          });
          doctorCreated++;
        }
      }
    }

    if (patientCreated > 0 || doctorCreated > 0) {
      logger.info(`[Profile Sync] Auto-populated ${patientCreated} missing Patient records & ${doctorCreated} missing Doctor records.`);
    }
  } catch (err: any) {
    logger.error(`[Profile Sync Error] Failed to sync missing profiles: ${err.message}`);
  }
}
