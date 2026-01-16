import axios from 'axios';

const API_URL = 'http://localhost:3002/api/chat';

async function testChat() {
    console.log('🤖 Testing QWEN Chatbot...');
    try {
        const response = await axios.post(`${API_URL}/message`, {
            message: "Hola, ¿puedes explicarme qué son las fracciones?",
            subject: "Saberes y Pensamiento Científico",
            sessionId: "test-session-" + Date.now()
        });

        console.log('✅ Chat Response Received!');
        console.log('Response Type:', response.data.reply ? 'Reply' : 'No Reply');
        console.log('Content:', response.data.reply);
        console.log('Is Mock:', response.data.isMock);

    } catch (error) {
        console.error('❌ Chat Failed');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else {
            console.error('Error:', error.message);
            if (error.code) console.error('Code:', error.code);
        }
    }
}

testChat();
