import axios from 'axios';

const API_URL = 'http://localhost:3002/api/auth';

async function testLogin() {
    console.log('🧪 Testing Admin Login...');
    try {
        const response = await axios.post(`${API_URL}/login`, {
            email: 'admin@universo-edu.mx',
            password: 'admin1234'
        });

        console.log('✅ Login Successful!');
        console.log('Token received:', !!response.data.token);
        console.log('User:', response.data.user);
    } catch (error) {
        console.error('❌ Login Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
            console.error('Code:', error.code);
            if (error.address) console.error('Address:', error.address);
            if (error.port) console.error('Port:', error.port);
        }
    }
}

testLogin();
