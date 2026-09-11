import { createPatientSchema, updatePatientSchema } from '../validators/patient.validator';
import './setup';

describe('Patient Profile Validation & CRUD Schemas', () => {
  it('should validate valid patient creation schema', () => {
    const input = {
      dob: '1992-08-25',
      gender: 'female',
      phone: '+15550192',
      address: '123 Medical Way',
      medicalHistory: ['Asthma'],
      allergies: ['Penicillin'],
    };

    const parsed = createPatientSchema.parse(input);
    expect(parsed.gender).toBe('female');
    expect(parsed.medicalHistory).toContain('Asthma');
  });

  it('should reject patient creation with invalid gender', () => {
    const input = {
      dob: '1992-08-25',
      gender: 'invalid_gender',
    };

    expect(() => createPatientSchema.parse(input)).toThrow();
  });

  it('should validate partial patient update schema', () => {
    const updateInput = {
      phone: '+15559999',
      address: '456 Healthcare Blvd',
    };

    const parsed = updatePatientSchema.parse(updateInput);
    expect(parsed.phone).toBe('+15559999');
  });
});
