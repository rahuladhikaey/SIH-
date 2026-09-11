import { Schema, model, Document, Types } from 'mongoose';

export interface IDoctor extends Document {
  userId: Types.ObjectId;
  licenseNumber: string;
  specialization: string;
  department?: string;
  phone?: string;
  yearsOfExperience?: number;
  createdAt: Date;
  updatedAt: Date;
}

const doctorSchema = new Schema<IDoctor>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    licenseNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    specialization: {
      type: String,
      required: true,
      trim: true,
    },
    department: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    yearsOfExperience: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

export const Doctor = model<IDoctor>('Doctor', doctorSchema);
