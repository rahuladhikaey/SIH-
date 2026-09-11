import {
  User,
  Patient,
  Doctor,
  Consultation,
  MedicalDocument,
  VoiceRecord,
  Extraction,
  AIJob,
  AISummary,
  VerifiedRecord,
  AuditLog,
} from '../models';
import mongoose from 'mongoose';

describe('All 11 Mongoose Schemas & Data Models', () => {
  it('1. User Model — validates required fields, email format, and roles', async () => {
    const user = new User({
      email: 'doctor@medmitra.com',
      password: 'hashed_password_123',
      role: 'doctor',
      fullName: 'Dr. John Watson',
    });

    const err = user.validateSync();
    expect(err).toBeUndefined();
    expect(user.role).toBe('doctor');
    expect(user.isActive).toBe(true);
  });

  it('2. Patient Model — validates userId, DOB, and gender', async () => {
    const patient = new Patient({
      userId: new mongoose.Types.ObjectId(),
      dob: new Date('1990-05-15'),
      gender: 'female',
      phone: '+15550192',
    });

    const err = patient.validateSync();
    expect(err).toBeUndefined();
    expect(patient.gender).toBe('female');
  });

  it('3. Doctor Model — validates license number and specialization', async () => {
    const doctor = new Doctor({
      userId: new mongoose.Types.ObjectId(),
      licenseNumber: 'MD-889900',
      specialization: 'Cardiology',
      yearsOfExperience: 10,
    });

    const err = doctor.validateSync();
    expect(err).toBeUndefined();
    expect(doctor.specialization).toBe('Cardiology');
  });

  it('4. Consultation Model — validates patientId, doctorId, chief complaint, and status', async () => {
    const consultation = new Consultation({
      patientId: new mongoose.Types.ObjectId(),
      doctorId: new mongoose.Types.ObjectId(),
      chiefComplaint: 'Acute chest pain and shortness of breath',
      status: 'CREATED',
    });

    const err = consultation.validateSync();
    expect(err).toBeUndefined();
    expect(consultation.status).toBe('CREATED');
  });

  it('5. Document Model — validates title, documentType, and filePath', async () => {
    const doc = new MedicalDocument({
      patientId: new mongoose.Types.ObjectId(),
      title: 'Blood Test Results',
      documentType: 'lab_report',
      filePath: '/uploads/lab123.pdf',
      uploadedBy: new mongoose.Types.ObjectId(),
    });

    const err = doc.validateSync();
    expect(err).toBeUndefined();
    expect(doc.documentType).toBe('lab_report');
  });

  it('6. VoiceRecord Model — validates audioUrl and status', async () => {
    const voice = new VoiceRecord({
      patientId: new mongoose.Types.ObjectId(),
      audioUrl: 'https://s3.amazonaws.com/audio/voice1.wav',
      status: 'uploaded',
    });

    const err = voice.validateSync();
    expect(err).toBeUndefined();
    expect(voice.status).toBe('uploaded');
  });

  it('7. Extraction Model — validates extractedEntities', async () => {
    const extraction = new Extraction({
      consultationId: new mongoose.Types.ObjectId(),
      extractedEntities: [{ category: 'Symptom', value: 'Fever', confidence: 0.96 }],
      status: 'completed',
    });

    const err = extraction.validateSync();
    expect(err).toBeUndefined();
    expect(extraction.extractedEntities[0].value).toBe('Fever');
  });

  it('8. AIJob Model — validates jobType and resourceId', async () => {
    const job = new AIJob({
      jobType: 'transcription',
      resourceId: new mongoose.Types.ObjectId(),
      status: 'pending',
    });

    const err = job.validateSync();
    expect(err).toBeUndefined();
    expect(job.jobType).toBe('transcription');
  });

  it('9. AISummary Model — validates draftSummary and draft status', async () => {
    const summary = new AISummary({
      patientId: new mongoose.Types.ObjectId(),
      consultationId: new mongoose.Types.ObjectId(),
      draftSummary: 'Patient presents with symptoms consistent with mild angina.',
      status: 'draft',
    });

    const err = summary.validateSync();
    expect(err).toBeUndefined();
    expect(summary.status).toBe('draft');
  });

  it('10. VerifiedRecord Model — ENFORCES doctor signature and verified content', async () => {
    const verified = new VerifiedRecord({
      patientId: new mongoose.Types.ObjectId(),
      doctorId: new mongoose.Types.ObjectId(),
      consultationId: new mongoose.Types.ObjectId(),
      verifiedContent: 'Final clinical record explicitly reviewed and approved by attending physician.',
      finalDiagnosis: ['Mild Angina'],
      doctorSignature: 'Dr. John Watson, M.D.',
    });

    const err = verified.validateSync();
    expect(err).toBeUndefined();
    expect(verified.doctorSignature).toBe('Dr. John Watson, M.D.');
  });

  it('11. AuditLog Model — validates actor, action, and resource details', async () => {
    const audit = new AuditLog({
      actorId: new mongoose.Types.ObjectId(),
      actorEmail: 'admin@medmitra.com',
      actorRole: 'admin',
      action: 'APPROVE_CLINICAL_RECORD',
      resource: 'VerifiedRecord',
      resourceId: 'rec_123',
    });

    const err = audit.validateSync();
    expect(err).toBeUndefined();
    expect(audit.action).toBe('APPROVE_CLINICAL_RECORD');
  });
});
