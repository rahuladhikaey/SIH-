import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import supertest from 'supertest';
import { createApp } from '../app';
import { config } from '../config';
import { registerSchema, loginSchema } from '../validators/auth.validator';
import { User } from '../models/User';
import './setup';

const app = createApp();
const request = supertest(app);

describe('Authentication & Security Unit & Integration Tests', () => {
  it('Password Hashing — should hash passwords securely with bcrypt', async () => {
    const rawPassword = 'MySecretPassword123!';
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(rawPassword, salt);

    expect(hashedPassword).not.toBe(rawPassword);
    expect(hashedPassword.startsWith('$2')).toBe(true);

    const isMatch = await bcrypt.compare(rawPassword, hashedPassword);
    expect(isMatch).toBe(true);

    const isInvalid = await bcrypt.compare('WrongPassword', hashedPassword);
    expect(isInvalid).toBe(false);
  });

  it('JWT Token Generation & Verification — should sign and verify JWT tokens', () => {
    const payload = {
      id: '507f1f77bcf86cd799439011',
      email: 'doctor@medmitra.com',
      role: 'doctor',
      fullName: 'Dr. Gregory House',
    };

    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });
    expect(token).toBeDefined();

    const decoded = jwt.verify(token, config.jwtSecret) as typeof payload;
    expect(decoded.email).toBe('doctor@medmitra.com');
    expect(decoded.role).toBe('doctor');
  });

  it('Auth Validator — should validate registration input schema', () => {
    const validPatientInput = {
      email: 'patient@example.com',
      password: 'password123',
      role: 'patient',
      fullName: 'Jane Patient',
    };
    const parsed = registerSchema.parse(validPatientInput);
    expect(parsed.email).toBe('patient@example.com');

    const invalidInput = {
      email: 'not-an-email',
      password: '123',
      role: 'invalid_role',
      fullName: 'A',
    };
    expect(() => registerSchema.parse(invalidInput)).toThrow();
  });

  it('Auth Validator — should validate login input schema', () => {
    const validLogin = {
      email: 'user@example.com',
      password: 'myPassword123',
    };
    const parsed = loginSchema.parse(validLogin);
    expect(parsed.email).toBe('user@example.com');
  });

  it('Unauthorized Requests — should return 401 for protected endpoints without Bearer token', async () => {
    const res = await request.get('/api/v1/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
    expect(res.body.error.message).toContain('Authentication required');
  });
});
