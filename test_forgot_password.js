const axios = require('axios');

async function testPasswordReset() {
    const baseURL = 'http://localhost:3000';
    const emailId = 'testuser123@example.com';
    console.log('Testing forgot password flow for:', emailId);

    try {
        // 1. Generate OTP
        console.log('\n--- Step 1: Forgot Password ---');
        const resetRes = await axios.post(`${baseURL}/user/forgot-password`, { emailId });
        console.log('Response:', resetRes.data);

        if (resetRes.data.success) {
            console.log('\n✅ Successfully sent OTP to email. Please check the DB or mailcatcher for the OTP to continue manual testing.');
        } else {
            console.error('❌ Failed to send OTP');
        }
    } catch (err) {
        console.error('❌ Error during testing:', err.response ? err.response.data : err.message);
    }
}

testPasswordReset();
