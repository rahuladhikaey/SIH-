import { Schema, model, Document, Types } from 'mongoose';

export type AIJobType = 'transcription' | 'extraction' | 'summarization';
export type AIJobStatus = 'pending' | 'processing' | 'completed' | 'failed';

export interface IAIJob extends Document {
  jobType: AIJobType;
  resourceId: Types.ObjectId;
  status: AIJobStatus;
  payload?: Record<string, any>;
  result?: Record<string, any>;
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const aiJobSchema = new Schema<IAIJob>(
  {
    jobType: {
      type: String,
      enum: ['transcription', 'extraction', 'summarization'],
      required: true,
    },
    resourceId: {
      type: Schema.Types.ObjectId,
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending',
    },
    payload: {
      type: Schema.Types.Mixed,
    },
    result: {
      type: Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const AIJob = model<IAIJob>('AIJob', aiJobSchema);
