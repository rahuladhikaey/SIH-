import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['patient', 'doctor', 'admin'], {
    errorMap: () => ({ message: "Role must be 'patient', 'doctor', or 'admin'" }),
  }),
  fullName: z.string().min(2, 'Full name must be at least 2 characters long'),
  // Optional doctor / patient specific details upon registration
  licenseNumber: z.string().optional(),
  specialization: z.string().optional(),
  dob: z.string().optional(),
  gender: z
    .preprocess((val) => (typeof val === 'string' ? val.toLowerCase() : val), z.enum(['male', 'female', 'other']))
    .optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
  role: z.enum(['patient', 'doctor', 'admin']).optional(),
});
