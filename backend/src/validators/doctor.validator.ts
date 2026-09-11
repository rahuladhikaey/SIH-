import { z } from 'zod';

export const createDoctorSchema = z.object({
  userId: z.string().optional(),
  licenseNumber: z.string().min(3, 'License number is required'),
  specialization: z.string().min(2, 'Specialization is required'),
  department: z.string().optional(),
  phone: z.string().optional(),
  yearsOfExperience: z.number().min(0).optional(),
});

export const updateDoctorSchema = createDoctorSchema.partial();
