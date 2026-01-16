import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.QWEN_CHATBOT_API_KEY;
const URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

async function testDirect() {
    console.log('Testing QWEN API...');
    console.log('Key present:', !!API_KEY);

    try {
        const response = await axios.post(URL, {
            model: 'qwen-max',
            messages: [{ role: 'user', content: 'Hola' }],
            temperature: 0.7,
            max_tokens: 100
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        fs.writeFileSync('api-result.json', JSON.stringify({
            success: true,
            status: response.status,
            content: response.data.choices?.[0]?.message?.content
        }, null, 2));

        console.log('SUCCESS - Response saved to api-result.json');
    } catch (error) {
        fs.writeFileSync('api-result.json', JSON.stringify({
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        }, null, 2));

        console.log('FAILED - Error saved to api-result.json');
    }
}

testDirect();
