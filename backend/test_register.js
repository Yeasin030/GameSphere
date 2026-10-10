const axios = require('axios');
const crypto = require('crypto');

async function testRegistration() {
    try {
        const baseURL = 'https://gamesphere.wasmer.app';
        
        console.log('Fetching CSRF cookie...');
        const csrfResponse = await axios.get(`${baseURL}/sanctum/csrf-cookie`, {
            withCredentials: true
        });
        
        const cookies = csrfResponse.headers['set-cookie'];
        console.log('Cookies received:', cookies);
        
        let xsrfToken = '';
        if (cookies) {
            const xsrfCookie = cookies.find(c => c.startsWith('XSRF-TOKEN='));
            if (xsrfCookie) {
                xsrfToken = decodeURIComponent(xsrfCookie.split(';')[0].replace('XSRF-TOKEN=', ''));
            }
        }
        
        const randomString = crypto.randomBytes(4).toString('hex');
        
        console.log('Sending registration request...');
        const registerResponse = await axios.post(`${baseURL}/api/v1/auth/register`, {
            username: `testuser_${randomString}`,
            email: `testuser_${randomString}@example.com`,
            password: 'Password123!',
            password_confirmation: 'Password123!',
            display_name: `Test User ${randomString}`
        }, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-XSRF-TOKEN': xsrfToken,
                'Cookie': cookies ? cookies.map(c => c.split(';')[0]).join('; ') : ''
            },
            withCredentials: true
        });
        
        console.log('Registration Success:', registerResponse.status, registerResponse.data);
    } catch (err) {
        if (err.response) {
            console.error('Registration Failed:', err.response.status, err.response.data);
        } else {
            console.error('Request Failed:', err.message);
        }
    }
}

testRegistration();
