import { Schema, model, Document, Types } from 'mongoose';

export type AISummaryStatus = 'draft' | 'AI_GENERATED' | 'PENDING_REVIEW' | 'approved' | 'rejected' | 'modified';

export interface IAISummary extends Document {
  patientId: Types.ObjectId;
  consultationId: Types.ObjectId;
  draftSummary: string;
  keyFindings?: string[];
  suggestedDiagnosis?: string[];
  structuredOutput?: Record<string, any>;
  originalAiOutput?: string;
  modelInfo?: string;
  evidenceChunks?: Array<Record<string, any>>;
  status: AISummaryStatus;
  requiresReview?: boolean;
  doctorNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiSummarySchema = new Schema<IAISummary>(
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
      required: true,
      index: true,
    },
    draftSummary: {
      type: String,
      required: true,
    },
    keyFindings: [{ type: String }],
    suggestedDiagnosis: [{ type: String }],
    structuredOutput: { type: Schema.Types.Mixed },
    originalAiOutput: { type: String },
    modelInfo: { type: String },
    evidenceChunks: [{ type: Schema.Types.Mixed }],
    status: {
      type: String,
      enum: ['draft', 'AI_GENERATED', 'PENDING_REVIEW', 'approved', 'rejected', 'modified'],
      default: 'PENDING_REVIEW',
    },
    requiresReview: {
      type: Boolean,
      default: true,
    },
    doctorNotes: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const AISummary = model<IAISummary>('AISummary', aiSummarySchema);
