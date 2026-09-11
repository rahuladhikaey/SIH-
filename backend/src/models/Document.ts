import { Schema, model, Document as MongooseDoc, Types } from 'mongoose';

export type DocumentType = 'lab_report' | 'prescription' | 'imaging' | 'other';
export type StorageProviderType = 's3' | 'local' | 'gridfs';

export interface IDocument extends MongooseDoc {
  patientId: Types.ObjectId;
  title: string;
  originalFilename: string;
  documentType: DocumentType;
  storageProvider: StorageProviderType;
  storageKey: string;
  filePath: string;
  mimeType?: string;
  fileSize?: number;
  uploadedBy: Types.ObjectId;
  deletedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: 'Patient',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalFilename: {
      type: String,
      default: 'document',
    },
    documentType: {
      type: String,
      enum: ['lab_report', 'prescription', 'imaging', 'other'],
      required: true,
    },
    storageProvider: {
      type: String,
      enum: ['s3', 'local', 'gridfs'],
      default: 'gridfs',
    },
    storageKey: {
      type: String,
      default: function (this: any) {
        return this.filePath || 'storage_key';
      },
    },
    filePath: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
    },
    fileSize: {
      type: Number,
      default: 0,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

export const MedicalDocument = model<IDocument>('Document', documentSchema);
