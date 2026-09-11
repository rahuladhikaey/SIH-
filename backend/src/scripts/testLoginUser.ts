import axios from 'axios';

async function testLogin() {
  console.log('Testing Login for brand.pritam7@gmail.com under Patient Login tab (role="patient")...');
  try {
    const resPat = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'brand.pritam7@gmail.com',
      password: 'password123',
      role: 'patient'
    });
    console.log('Patient login res:', resPat.data);
  } catch (err: any) {
    console.log('❌ Patient login error response:', err.response?.status, err.response?.data);
  }

  console.log('\nTesting Login for brand.pritam7@gmail.com under Doctor Login tab (role="doctor")...');
  try {
    const resDoc = await axios.post('http://localhost:5000/api/v1/auth/login', {
      email: 'brand.pritam7@gmail.com',
      password: 'password123',
      role: 'doctor'
    });
    console.log('✅ Doctor login res:', resDoc.data);
  } catch (err: any) {
    console.log('❌ Doctor login error response:', err.response?.status, err.response?.data);
  }
}

testLogin();
