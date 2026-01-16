import axios from 'axios';
import dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.QWEN_CHATBOT_API_KEY;
const URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

console.log('🔑 Testing Key:', API_KEY ? `${API_KEY.slice(0, 6)}...` : 'MISSING');

async function testDirect() {
    try {
        const response = await axios.post(URL, {
            model: 'qwen-max',
            messages: [{ role: 'user', content: 'Hello' }],
            temperature: 0.7
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            }
        });
        console.log('✅ Success:', response.data);
    } catch (error) {
        console.error('❌ Failed:', error.message);
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
            console.error('Headers:', error.response.headers);
        }
    }
}

if (!API_KEY) {
    console.error('❌ QWEN_CHATBOT_API_KEY not found in environment');
} else {
    testDirect();
}
