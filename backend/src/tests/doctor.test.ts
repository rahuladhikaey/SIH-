import { createDoctorSchema, updateDoctorSchema } from '../validators/doctor.validator';
import './setup';

describe('Doctor Profile Validation & CRUD Schemas', () => {
  it('should validate valid doctor creation schema', () => {
    const input = {
      licenseNumber: 'MD-998877',
      specialization: 'Cardiology',
      department: 'Cardiovascular Care',
      phone: '+15550188',
      yearsOfExperience: 12,
    };

    const parsed = createDoctorSchema.parse(input);
    expect(parsed.licenseNumber).toBe('MD-998877');
    expect(parsed.specialization).toBe('Cardiology');
  });

  it('should reject doctor creation missing required license number', () => {
    const input = {
      specialization: 'Cardiology',
    };

    expect(() => createDoctorSchema.parse(input)).toThrow();
  });

  it('should validate partial doctor update schema', () => {
    const updateInput = {
      department: 'Emergency Medicine',
      yearsOfExperience: 15,
    };

    const parsed = updateDoctorSchema.parse(updateInput);
    expect(parsed.department).toBe('Emergency Medicine');
  });
});
