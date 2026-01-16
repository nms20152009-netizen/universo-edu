import axios from 'axios';
import { qwenConfig } from '../config/qwen.js';

/**
 * QWEN 3.5 MAX API Service
 * Handles all AI model interactions with fallback support
 * Uses intelligent mock mode when API fails or keys are not configured
 */
class QwenService {
    constructor() {
        this.isMockMode = this.checkMockMode();
        this.forceMockMode = false; // Set to true if API consistently fails

        if (!this.isMockMode) {
            console.log('🤖 QWEN Service initialized with API keys');
            this.clients = {
                chatbot: this.createClient(qwenConfig.keys.chatbot),
                taskGenerator: this.createClient(qwenConfig.keys.taskGenerator),
                fallback: this.createClient(qwenConfig.keys.fallback)
            };
        } else {
            console.log('🤖 QWEN Service running in MOCK MODE (no API keys configured)');
        }
    }

    checkMockMode() {
        const hasKeys = qwenConfig.keys.chatbot || qwenConfig.keys.taskGenerator;
        return !hasKeys;
    }

    createClient(apiKey) {
        if (!apiKey) return null;
        return axios.create({
            baseURL: qwenConfig.baseURL,
            timeout: qwenConfig.timeout,
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            }
        });
    }

    /**
     * Intelligent context-aware mock responses
     * Maintains coherence with conversation history
     */
    getMockResponse(messages) {
        // Get full conversation context
        const userMessages = messages.filter(m => m.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1];
        const userText = lastUserMessage?.content?.toLowerCase() || '';

        // Context tracking
        const conversationContext = this.extractContext(messages);

        // 1. Detect Direct Request for Procedure/Knowledge (Avoid looping)
        const isFrustrated = userText === 'nada' || userText === 'no' || userText === 'ayuda' || userText.length < 3;
        const needsDirectHelp = userText.includes('procedimiento') || userText.includes('cómo se hace') || userText.includes('explicame') || isFrustrated;

        // 2. Handle Name Introduction/Recall
        if (userText.includes('me llamo') || userText.includes('mi nombre es') || userText.includes('soy ')) {
            const nameMatch = userText.match(/(?:me llamo|mi nombre es|soy) (\w+)/i);
            if (nameMatch) {
                const name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
                return `¡Hola ${name}! 👋 ¡Qué gusto conocerte! Soy EDU, tu compañero de aprendizaje. ¿En qué tema te gustaría que trabajemos hoy? 📚`;
            }
        }

        if (userText.includes('mi nombre') || userText.includes('como me llamo') || userText.includes('sabes mi nombre')) {
            if (conversationContext.userName) {
                return `¡Por supuesto que te recuerdo, ${conversationContext.userName}! 😊 Estamos platicando sobre lo que quieras aprender. ¿En qué puedo ayudarte?`;
            }
            return `Hmm, no recuerdo que me hayas dicho tu nombre todavía. 🤔 ¿Cómo te llamas?`;
        }

        // 3. Subject-Specific Educational Logic (Knowledge Base)

        // --- MATEMÁTICAS: MCM / MCD ---
        if (userText.includes('mcm') || userText.includes('mínimo común múltiplo')) {
            if (needsDirectHelp || userText.match(/\d+/)) {
                return `¡Claro! El Mínimo Común Múltiplo (mcm) es el número más pequeño que es múltiplo de dos o más números. 🔢\n\n**Procedimiento:**\n1. Descomponemos los números en factores primos.\n2. Multiplicamos los factores comunes y no comunes con su mayor exponente.\n\nPor ejemplo, para **14 y 67**:\n- 14 = 2 x 7\n- 67 es un número primo.\n- mcm(14, 67) = 14 x 67 = **938**.\n\n¿Te gustaría que hagamos otro ejemplo juntos?`;
            }
            return `¡Entendido! El **mcm** es fundamental para sumar fracciones. ¿Qué números te gustaría calcular o qué duda específica tienes sobre el procedimiento?`;
        }

        // --- MATEMÁTICAS: FRACCIONES ---
        if (userText.includes('fraccion') || userText.includes('quebrado')) {
            if (needsDirectHelp) {
                return `Las fracciones representan partes de un todo. 🍕\n\nPara sumar fracciones con diferente denominador:\n1. Busca el **mcm** de los denominadores.\n2. Convierte las fracciones a equivalentes con ese denominador.\n3. Suma los numeradores.\n\n¿Tienes algún problema específico que quieras resolver?`;
            }
            return `¡Las fracciones están en todos lados! Especialmente en la cocina 🍕. ¿Estás aprendiendo a sumarlas, restarlas o a encontrar equivalencias?`;
        }

        // --- MATEMÁTICAS: GENERAL ---
        if (userText.includes('matemát') || userText.includes('número') || userText.includes('suma') || userText.includes('resta')) {
            return `¡Las matemáticas son fascinantes! 🔢 ¿Qué operación estás practicando? Cuéntame qué sabes y trabajemos juntos paso a paso. No te preocupes si parece difícil, ¡lo descubriremos juntos!`;
        }

        // --- ESPAÑOL / LENGUAJE ---
        if (userText.includes('español') || userText.includes('lectura') || userText.includes('escrib') || userText.includes('gramática') || userText.includes('acent')) {
            if (userText.includes('acent') || userText.includes('tild')) {
                return `¡La acentuación es clave para que nos entiendan! ✍️ Recuerda las reglas:\n- **Agudas**: Acentúan en la última si terminan en n, s o vocal.\n- **Graves**: Acentúan en la penúltima si NO terminan en n, s o vocal.\n- **Esdrújulas**: ¡Siempre se acentúan!\n\n¿Quieres que practiquemos con alguna palabra?`;
            }
            return '¡La lectura y escritura nos abren mundos! 📚 ¿Qué tipo de texto estás analizando? ¿Es un cuento, una noticia o tal vez un poema?';
        }

        // --- CIENCIAS ---
        if (userText.includes('ciencia') || userText.includes('natura') || userText.includes('experiment') || userText.includes('planta') || userText.includes('animal')) {
            return '¡Ser científico es como ser un detective de la naturaleza! 🔬 ¿Qué fenómeno estás observando? Dime qué crees que pasará y buscamos el porqué.';
        }

        // 4. Basic Interaction
        if (userText.match(/^(hola|hi|hey|buenos días|buenas tardes|buenas noches)/i)) {
            return '¡Hola! 👋 Soy EDU, tu compañero de aprendizaje. ¿En qué materia o tema te gustaría que te ayude hoy? 📚';
        }

        if (userText.includes('gracias') || userText.includes('thank')) {
            return '¡De nada! 😊 Me hace muy feliz serte útil. ¿Hay algo más que quieras explorar o aprender hoy?';
        }

        // 5. Fallback logic with minimal looping
        if (isFrustrated) {
            return `¡No te desanimes! A veces aprender temas nuevos toma tiempo. 💪 ¿Qué te parece si intentamos con algo más sencillo o me dices exactamente qué parte de tu tarea no entiendes?`;
        }

        const defaultResponses = [
            '¡Excelente tema! 🌟 Para ayudarte mejor, ¿podrías darme un ejemplo de lo que estás viendo en clase?',
            '¡Muy bien! 👏 Cuéntame, ¿qué es lo que más se te dificulta de este tema para que lo exploremos juntos?',
            '¡Qué curiosidad tan genial! 📚 ¿Te gustaría que te explique el concepto base o quieres ir directo a un ejercicio?',
            'Pensemos juntos. ✨ ¿Qué es lo primero que se te viene a la mente cuando piensas en este tema?'
        ];

        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
    }


    /**
     * Extract context from conversation history
     */
    extractContext(messages) {
        const context = {
            userName: null,
            subject: null,
            topic: null
        };

        for (const msg of messages) {
            if (msg.role === 'user') {
                const text = msg.content.toLowerCase();

                // Extract name
                const nameMatch = text.match(/(?:me llamo|mi nombre es|soy) (\w+)/i);
                if (nameMatch) {
                    context.userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
                }

                // Extract subject
                if (text.includes('matemát')) context.subject = 'matemáticas';
                if (text.includes('español') || text.includes('lectura')) context.subject = 'español';
                if (text.includes('historia')) context.subject = 'historia';
                if (text.includes('ciencia')) context.subject = 'ciencias';
            }
        }

        return context;
    }

    /**
     * Mock task generation
     */
    getMockTaskResponse(subject, topic) {
        return JSON.stringify({
            title: `Explorando ${topic}`,
            description: `Una actividad práctica para descubrir conceptos sobre ${topic} de manera divertida y significativa.`,
            learningObjective: `Desarrollar comprensión y habilidades relacionadas con ${topic} a través de la exploración y el descubrimiento.`,
            instructions: [
                { step: 1, text: 'Lee la descripción de la actividad con atención.' },
                { step: 2, text: 'Reúne los materiales necesarios.' },
                { step: 3, text: 'Trabaja en equipo con tus compañeros para resolver el reto.' },
                { step: 4, text: 'Presenta tus descubrimientos a la clase.' },
                { step: 5, text: 'Reflexiona sobre lo que aprendiste.' }
            ],
            materials: ['Cuaderno', 'Lápices de colores', 'Materiales reciclados'],
            duration: 45,
            isCollaborative: true
        });
    }

    /**
     * Send a chat completion request
     * Falls back to mock mode if API fails
     */
    async chat(clientType, messages, customParams = {}) {
        // Return mock response if in mock mode or forced mock mode
        if (this.isMockMode || this.forceMockMode) {
            await this.delay(300); // Simulate API latency

            if (clientType === 'taskGenerator') {
                const systemMsg = messages.find(m => m.role === 'system')?.content || '';
                const topicMatch = systemMsg.match(/tema: (.+)/i);
                const subjectMatch = systemMsg.match(/campo formativo: (.+)/i);
                return this.getMockTaskResponse(
                    subjectMatch?.[1] || 'General',
                    topicMatch?.[1] || 'aprendizaje'
                );
            }

            return this.getMockResponse(messages);
        }

        const client = this.clients[clientType] || this.clients.chatbot;
        if (!client) {
            console.log('⚠️ No API client available, using mock mode');
            return this.getMockResponse(messages);
        }

        const params = { ...qwenConfig.defaultParams, ...customParams };

        let lastError;
        for (let attempt = 1; attempt <= qwenConfig.maxRetries; attempt++) {
            try {
                const response = await client.post('/chat/completions', {
                    model: qwenConfig.model,
                    messages,
                    ...params
                });

                return response.data.choices[0].message.content;
            } catch (error) {
                lastError = error;
                const status = error.response?.status;
                console.error(`QWEN API attempt ${attempt} failed:`, error.message, `Status: ${status}`);

                // If 401/403, API key is invalid - switch to mock mode permanently
                if (status === 401 || status === 403) {
                    console.log('⚠️ API authentication failed - switching to MOCK MODE');
                    this.forceMockMode = true;
                    return this.getMockResponse(messages);
                }

                if (attempt < qwenConfig.maxRetries) {
                    await this.delay(qwenConfig.retryDelay * attempt);
                }
            }
        }

        // Try fallback if primary fails
        if (clientType !== 'fallback' && this.clients.fallback) {
            console.log('Attempting fallback API...');
            return this.chat('fallback', messages, customParams);
        }

        // If all retries failed, use mock
        console.log('⚠️ All API attempts failed - using mock response');
        return this.getMockResponse(messages);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export const qwenService = new QwenService();
export default qwenService;
