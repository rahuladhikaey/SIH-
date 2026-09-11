import { Schema, model, Document, Types } from 'mongoose';

export interface IPatient extends Document {
  userId: Types.ObjectId;
  dob: Date;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medicalHistory?: string[];
  allergies?: string[];
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    dob: {
      type: Date,
      required: true,
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
      required: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    address: {
      type: String,
      trim: true,
    },
    medicalHistory: [{ type: String }],
    allergies: [{ type: String }],
    emergencyContact: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String },
    },
  },
  {
    timestamps: true,
  }
);

export const Patient = model<IPatient>('Patient', patientSchema);
