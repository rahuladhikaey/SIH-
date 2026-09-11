import { Schema, model, Document, Types } from 'mongoose';

export interface IExtractionEntity {
  category: string;
  value: string;
  confidence: number;
}

export interface IExtraction extends Document {
  consultationId?: Types.ObjectId;
  voiceRecordId?: Types.ObjectId;
  documentId?: Types.ObjectId;
  extractedEntities: IExtractionEntity[];
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

const extractionSchema = new Schema<IExtraction>(
  {
    consultationId: {
      type: Schema.Types.ObjectId,
      ref: 'Consultation',
    },
    voiceRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'VoiceRecord',
    },
    documentId: {
      type: Schema.Types.ObjectId,
      ref: 'Document',
    },
    extractedEntities: [
      {
        category: { type: String, required: true },
        value: { type: String, required: true },
        confidence: { type: Number, default: 1.0 },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

export const Extraction = model<IExtraction>('Extraction', extractionSchema);
