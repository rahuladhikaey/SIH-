import axios from 'axios';

async function testRegister() {
  const doctorEmail = `atlas_doctor_${Date.now()}@medmitra.com`;
  const patientEmail = `atlas_patient_${Date.now()}@medmitra.com`;

  console.log('Registering Doctor on http://localhost:5000/api/v1/auth/register...');
  try {
    const docRes = await axios.post('http://localhost:5000/api/v1/auth/register', {
      email: doctorEmail,
      password: 'Password123',
      role: 'doctor',
      fullName: 'Dr. Atlas Test',
      licenseNumber: `MD-${Date.now().toString().slice(-6)}`,
      specialization: 'Neurology'
    });
    console.log('✅ Doctor Registration Response:', docRes.data.message, docRes.data.data.user);
  } catch (err: any) {
    console.error('❌ Doctor Registration Error:', err.response?.data || err.message);
  }

  console.log('\nRegistering Patient on http://localhost:5000/api/v1/auth/register...');
  try {
    const patRes = await axios.post('http://localhost:5000/api/v1/auth/register', {
      email: patientEmail,
      password: 'Password123',
      role: 'patient',
      fullName: 'Riya Atlas Patient',
      dob: '1998-05-15',
      gender: 'female'
    });
    console.log('✅ Patient Registration Response:', patRes.data.message, patRes.data.data.user);
  } catch (err: any) {
    console.error('❌ Patient Registration Error:', err.response?.data || err.message);
  }
}

testRegister();
