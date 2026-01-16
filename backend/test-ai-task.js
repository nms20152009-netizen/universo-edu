import aiService from './services/aiService.js';
import dotenv from 'dotenv';
dotenv.config();

const testTaskGen = async () => {
    console.log('Testing Task Generation AI...');
    const messages = [
        {
            role: 'system',
            content: `Eres un experto en diseño curricular. Responde SOLO con JSON: { "title": "...", "description": "...", "learningObjective": "...", "instructions": [], "materials": [], "duration": 30, "isCollaborative": true }`
        },
        { role: 'user', content: 'Crea una tarea sobre "Fracciones" para 6° grado.' }
    ];

    try {
        const response = await aiService.chat(messages);
        console.log('AI Response:');
        console.log(response);
    } catch (error) {
        console.error('Error:', error.message);
    }
};

testTaskGen();
