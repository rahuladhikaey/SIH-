import { z } from 'zod';

export const createConsultationSchema = z.object({
  patientId: z.string().min(1, 'Patient ID is required'),
  doctorId: z.string().min(1, 'Doctor ID is required'),
  chiefComplaint: z.string().min(3, 'Chief complaint is required'),
  symptoms: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const updateConsultationSchema = z.object({
  chiefComplaint: z.string().optional(),
  symptoms: z.array(z.string()).optional(),
  status: z.enum(['scheduled', 'active', 'completed', 'review_pending', 'approved', 'rejected']).optional(),
  notes: z.string().optional(),
});

export const verifyRecordSchema = z.object({
  consultationId: z.string().min(1, 'Consultation ID is required'),
  aiSummaryId: z.string().optional(),
  verifiedContent: z.string().min(10, 'Verified content must be detailed'),
  finalDiagnosis: z.array(z.string()).min(1, 'At least one final diagnosis is required'),
  prescribedTreatment: z.string().optional(),
  doctorSignature: z.string().min(2, 'Doctor signature is required'),
});
