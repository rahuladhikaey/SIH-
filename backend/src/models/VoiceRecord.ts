import { Schema, model, Document, Types } from 'mongoose';

export type VoiceRecordStatus = 'uploaded' | 'processing' | 'transcribed' | 'failed';

export interface IVoiceRecord extends Document {
  patientId: Types.ObjectId;
  consultationId?: Types.ObjectId;
  audioUrl: string;
  durationSeconds?: number;
  transcription?: string;
  status: VoiceRecordStatus;
  createdAt: Date;
  updatedAt: Date;
}

const voiceRecordSchema = new Schema<IVoiceRecord>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
    },
    audioUrl: {
      type: String,
      required: true,
    },
    durationSeconds: {
      type: Number,
    },
    transcription: {
      type: String,
    },
    status: {
      type: String,
      enum: ['uploaded', 'processing', 'transcribed', 'failed'],
      default: 'uploaded',
    },
  },
  {
    timestamps: true,
  }
);

export const VoiceRecord = model<IVoiceRecord>('VoiceRecord', voiceRecordSchema);
