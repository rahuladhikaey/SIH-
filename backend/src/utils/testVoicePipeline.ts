import { connectDB, disconnectDB } from './db';
import { FileStorageService } from '../services/storage/fileStorage.service';
import { VoiceRecord } from '../models/VoiceRecord';
import { Consultation } from '../models/Consultation';
import { Patient } from '../models/Patient';
import { Doctor } from '../models/Doctor';
import { User } from '../models/User';
import { processAIJobTask } from '../queue/aiJob.queue';
import { Readable } from 'stream';
import { Types } from 'mongoose';

async function runTest() {
  console.log('=== STARTING VOICE PIPELINE DIAGNOSTIC TEST ===');
  await connectDB();

  try {
    // 1. Get or create test patient
    let patient = await Patient.findOne();
    if (!patient) {
      let user = await User.create({
        fullName: 'Test Patient Voice',
        email: `testpatient_${Date.now()}@medmitra.com`,
        password: 'Password123!',
        role: 'patient',
      });
      patient = await Patient.create({
        userId: user._id,
        dob: new Date('1995-05-05'),
        gender: 'female',
      });
    }

    // 2. Get or create test doctor
    let doctor = await Doctor.findOne();
    if (!doctor) {
      let docUser = await User.create({
        fullName: 'Dr. Test Voice',
        email: `testdoc_${Date.now()}@medmitra.com`,
        password: 'Password123!',
        role: 'doctor',
      });
      doctor = await Doctor.create({
        userId: docUser._id,
        licenseNumber: 'MD-999999',
        specialization: 'General Practice',
      });
    }

    // 3. Create active consultation
    const consultation = await Consultation.create({
      patientId: patient._id,
      doctorId: doctor._id,
      chiefComplaint: 'Patient voice testing: fever, sore throat, and severe body aches for 2 days.',
      status: 'CREATED',
    });

    console.log(`[Test] Created Consultation: ${consultation._id}`);

    // 4. Create sample audio buffer (simulate browser recording bytes)
    const sampleAudioBytes = Buffer.from(
      'RIFF4400WAVEfmt 160010008032000002001600data2000' + '0'.repeat(2000),
      'utf-8'
    );
    const audioStream = Readable.from(sampleAudioBytes);

    // 5. Store file in GridFS via Buffer
    const storedFile = await FileStorageService.storeBuffer(sampleAudioBytes, {
      filename: 'test_voice_recording.wav',
      mimeType: 'audio/wav',
      metadata: {
        patientId: patient._id.toString(),
        type: 'voice_recording',
      },
    });

    console.log(`[Test] Stored Voice in GridFS. File ID: ${storedFile.fileId}`);

    // 6. Create Voice Record
    const voiceRecord = await VoiceRecord.create({
      patientId: patient._id,
      consultationId: consultation._id,
      audioUrl: storedFile.fileId,
      durationSeconds: 5,
      status: 'uploaded',
    });

    console.log(`[Test] Created VoiceRecord: ${voiceRecord._id}`);

    // 7. Run processAIJobTask
    const result = await processAIJobTask({
      dbJobId: new Types.ObjectId().toString(),
      jobType: 'transcription',
      patientId: patient._id.toString(),
      consultationId: consultation._id.toString(),
      resourceId: voiceRecord._id.toString(),
      payload: { fileId: storedFile.fileId },
    });

    console.log('=== AI JOB RESULT ===');
    console.log('Transcription:', result.transcription);
    console.log('Symptoms Extracted:', result.symptoms);
    console.log('Clinical Summary:', result.summary);

    // 8. Verify Consultation Status
    const updatedConsultation = await Consultation.findById(consultation._id);
    console.log(`[Test] Updated Consultation Status: ${updatedConsultation?.status}`);

    console.log('=== DIAGNOSTIC TEST COMPLETED SUCCESSFULLY ===');
  } catch (err: any) {
    console.error('=== TEST ERROR ===', err);
  } finally {
    await disconnectDB();
  }
}

runTest();
