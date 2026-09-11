import { Schema, model, Document, Types } from 'mongoose';

export interface IVerifiedRecord extends Document {
  patientId: Types.ObjectId;
  doctorId: Types.ObjectId;
  consultationId: Types.ObjectId;
  aiSummaryId?: Types.ObjectId;
  verifiedContent: string;
  finalDiagnosis: string[];
  prescribedTreatment?: string;
  verifiedAt: Date;
  doctorSignature: string;
  createdAt: Date;
  updatedAt: Date;
}

const verifiedRecordSchema = new Schema<IVerifiedRecord>(
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
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
      required: true,
      index: true,
    },
    aiSummaryId: {
      type: Schema.Types.ObjectId,
      ref: 'AISummary',
    },
    verifiedContent: {
      type: String,
      required: true,
    },
    finalDiagnosis: [
      {
        type: String,
        required: true,
      },
    ],
    prescribedTreatment: {
      type: String,
    },
    verifiedAt: {
      type: Date,
      default: Date.now,
    },
    doctorSignature: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const VerifiedRecord = model<IVerifiedRecord>('VerifiedRecord', verifiedRecordSchema);
