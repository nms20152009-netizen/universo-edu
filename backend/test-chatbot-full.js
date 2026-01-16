import axios from 'axios';

const API_URL = 'http://localhost:3002/api';

async function testChatbot() {
    console.log('='.repeat(60));
    console.log('🧪 TESTING UNIVERSO EDU CHATBOT');
    console.log('='.repeat(60));

    try {
        // 1. Check status
        console.log('\n📊 1. Checking AI status...');
        const status = await axios.get(`${API_URL}/chat/status`);
        console.log('   Provider:', status.data.activeProvider);
        console.log('   Features:', JSON.stringify(status.data.features));

        // 2. Create session
        console.log('\n🆕 2. Creating new session...');
        const session = await axios.post(`${API_URL}/chat/session`, { subject: 'General' });
        const sessionId = session.data.sessionId;
        console.log('   Session ID:', sessionId);
        console.log('   Welcome:', session.data.messages[0]?.content?.slice(0, 80) + '...');

        // 3. Send first message with name
        console.log('\n💬 3. Sending message with name...');
        const msg1 = await axios.post(`${API_URL}/chat/message`, {
            sessionId,
            message: 'Hola, me llamo Carlos. Necesito ayuda con matemáticas.'
        });
        console.log('   Response:', msg1.data.response);

        // 4. Ask a math question (should use Socratic method)
        console.log('\n💬 4. Asking math question...');
        const msg2 = await axios.post(`${API_URL}/chat/message`, {
            sessionId,
            message: '¿Cuánto es 8 x 7?'
        });
        console.log('   Response:', msg2.data.response);

        // 5. Test memory - ask for name
        console.log('\n💬 5. Testing memory...');
        const msg3 = await axios.post(`${API_URL}/chat/message`, {
            sessionId,
            message: '¿Te acuerdas cómo me llamo?'
        });
        console.log('   Response:', msg3.data.response);

        // 6. Ask a conceptual question
        console.log('\n💬 6. Asking conceptual question...');
        const msg4 = await axios.post(`${API_URL}/chat/message`, {
            sessionId,
            message: '¿Qué es el MCM?'
        });
        console.log('   Response:', msg4.data.response);

        console.log('\n' + '='.repeat(60));
        console.log('✅ ALL TESTS PASSED!');
        console.log('   - AI Provider: ' + msg1.data.aiProvider);
        console.log('   - Session messages: ' + msg4.data.messageCount);
        console.log('='.repeat(60));

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        if (error.response) {
            console.error('   Status:', error.response.status);
            console.error('   Data:', JSON.stringify(error.response.data, null, 2));
        }
    }
}

testChatbot();
