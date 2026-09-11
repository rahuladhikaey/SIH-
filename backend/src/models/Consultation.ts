import { Schema, model, Document, Types } from 'mongoose';

export type ConsultationStatus =
  | 'CREATED'
  | 'PROCESSING'
  | 'AI_GENERATED'
  | 'PENDING_REVIEW'
  | 'DOCTOR_EDITED'
  | 'DOCTOR_APPROVED'
  | 'VERIFIED';

export interface IConsultation extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  chiefComplaint: string;
  symptoms?: string[];
  status: ConsultationStatus;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const consultationSchema = new Schema<IConsultation>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: 'Doctor',
      required: true,
      index: true,
    },
    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
    },
    symptoms: [{ type: String }],
    status: {
      type: String,
      enum: [
        'CREATED',
        'PROCESSING',
        'AI_GENERATED',
        'PENDING_REVIEW',
        'DOCTOR_EDITED',
        'DOCTOR_APPROVED',
        'VERIFIED',
      ],
      default: 'CREATED',
    },
    notes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Consultation = model<IConsultation>('Consultation', consultationSchema);
