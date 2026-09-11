import { z } from 'zod';

export const createPatientSchema = z.object({
  userId: z.string().optional(),
  dob: z.string().or(z.date()).transform((val) => new Date(val)),
  gender: z.enum(['male', 'female', 'other']),
  phone: z.string().optional(),
  address: z.string().optional(),
  medicalHistory: z.array(z.string()).optional(),
  allergies: z.array(z.string()).optional(),
  emergencyContact: z
    .object({
      name: z.string().optional(),
      phone: z.string().optional(),
      relation: z.string().optional(),
    })
    .optional(),
});

export const updatePatientSchema = createPatientSchema.partial();
