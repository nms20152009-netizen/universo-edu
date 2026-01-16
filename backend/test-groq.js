import axios from 'axios';
import dotenv from 'dotenv';
import fs from 'fs';
dotenv.config();

const API_KEY = process.env.GROQ_API_KEY;
const URL = 'https://api.groq.com/openai/v1/chat/completions';

async function testGroq() {
    console.log('Testing Groq API...');
    console.log('Key present:', !!API_KEY);
    console.log('Key prefix:', API_KEY?.slice(0, 10) + '...');

    try {
        const response = await axios.post(URL, {
            model: 'llama-3.3-70b-versatile',
            messages: [
                {
                    role: 'system',
                    content: 'Eres EDU, un asistente educativo para niños de primaria en México. Usa el método socrático: nunca des respuestas directas, haz preguntas para guiar.'
                },
                {
                    role: 'user',
                    content: 'Hola, me llamo Carlos. ¿Cuánto es 5 + 3?'
                }
            ],
            temperature: 0.7,
            max_tokens: 300
        }, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });

        const result = {
            success: true,
            status: response.status,
            model: response.data.model,
            content: response.data.choices?.[0]?.message?.content,
            usage: response.data.usage
        };

        fs.writeFileSync('groq-test-result.json', JSON.stringify(result, null, 2));
        console.log('\n✅ SUCCESS!');
        console.log('Response:', result.content);

    } catch (error) {
        const result = {
            success: false,
            error: error.message,
            status: error.response?.status,
            data: error.response?.data
        };

        fs.writeFileSync('groq-test-result.json', JSON.stringify(result, null, 2));
        console.log('\n❌ FAILED');
        console.log('Error:', error.message);
        if (error.response?.data) {
            console.log('Details:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testGroq();
