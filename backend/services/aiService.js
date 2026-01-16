import axios from 'axios';
import { groqConfig } from '../config/groq.js';
import { qwenConfig } from '../config/qwen.js';

/**
 * Unified AI Service
 * Supports multiple providers: Groq (primary), QWEN (fallback), Mock (offline)
 * Handles automatic fallback between providers
 */
class AIService {
    constructor() {
        this.providers = this.initializeProviders();
        this.activeProvider = this.detectActiveProvider();
        console.log(`🤖 AI Service initialized with provider: ${this.activeProvider}`);
    }

    initializeProviders() {
        const providers = {};

        // Groq - Primary (free tier, fast, good Spanish)
        if (groqConfig.apiKey) {
            providers.groq = {
                name: 'Groq',
                client: axios.create({
                    baseURL: groqConfig.baseURL,
                    timeout: groqConfig.timeout,
                    headers: {
                        'Authorization': `Bearer ${groqConfig.apiKey}`,
                        'Content-Type': 'application/json'
                    }
                }),
                model: groqConfig.model,
                fallbackModel: groqConfig.fallbackModel
            };
        }

        // QWEN - Secondary fallback
        if (qwenConfig.keys.chatbot) {
            providers.qwen = {
                name: 'QWEN',
                client: axios.create({
                    baseURL: qwenConfig.baseURL,
                    timeout: qwenConfig.timeout,
                    headers: {
                        'Authorization': `Bearer ${qwenConfig.keys.chatbot}`,
                        'Content-Type': 'application/json'
                    }
                }),
                model: qwenConfig.model
            };
        }

        return providers;
    }

    detectActiveProvider() {
        if (this.providers.groq) return 'groq';
        if (this.providers.qwen) return 'qwen';
        return 'mock';
    }

    /**
     * Send a chat completion request
     * Automatically handles fallback between providers
     */
    async chat(messages, customParams = {}) {
        const params = { ...groqConfig.defaultParams, ...customParams };

        // Try Groq first
        if (this.providers.groq) {
            try {
                return await this.callProvider('groq', messages, params);
            } catch (error) {
                console.warn('⚠️ Groq failed, trying fallback:', error.message);
            }
        }

        // Try QWEN as fallback
        if (this.providers.qwen) {
            try {
                return await this.callProvider('qwen', messages, params);
            } catch (error) {
                console.warn('⚠️ QWEN failed:', error.message);
            }
        }

        // Use intelligent mock as last resort
        console.log('📝 Using mock response (no AI providers available)');

        // Detect if this is a task generation request
        const systemMsg = messages.find(m => m.role === 'system')?.content || '';
        const isTaskGen = systemMsg.includes('diseño curricular') || systemMsg.includes('JSON');

        if (isTaskGen) {
            const userMsg = messages.find(m => m.role === 'user')?.content || '';
            const topicMatch = userMsg.match(/tema "([^"]+)"/i) || userMsg.match(/sobre "([^"]+)"/i);
            const subjectMatch = userMsg.match(/formativo "([^"]+)"/i);
            return this.getMockTaskResponse(
                subjectMatch?.[1] || 'General',
                topicMatch?.[1] || 'Aprendizaje'
            );
        }

        return this.getMockResponse(messages);
    }

    /**
     * Mock task generation (valid JSON)
     */
    getMockTaskResponse(subject, topic) {
        return JSON.stringify({
            title: `Explorando ${topic}`,
            description: `Una actividad práctica para descubrir conceptos sobre ${topic} de manera divertida y significativa en el campo de ${subject}.`,
            learningObjective: `Desarrollar comprensión y habilidades relacionadas con ${topic} a través de la exploración y el descubrimiento.`,
            instructions: [
                { "step": 1, "text": "Reúne los materiales necesarios en tu espacio de trabajo." },
                { "step": 2, "text": `Investiga o recuerda lo que sabes sobre ${topic}.` },
                { "step": 3, "text": "Realiza un dibujo o esquema que represente tu aprendizaje." }
            ],
            materials: ["Cuaderno", "Lápices de colores", "Materiales reciclados"],
            duration: "30 minutos",
            isCollaborative: true,
            ejeArticulador: "Pensamiento Crítico"
        });
    }

    async callProvider(providerName, messages, params) {
        const provider = this.providers[providerName];
        if (!provider) throw new Error(`Provider ${providerName} not available`);

        for (let attempt = 1; attempt <= 3; attempt++) {
            try {
                const response = await provider.client.post('/chat/completions', {
                    model: provider.model,
                    messages,
                    ...params
                });

                return response.data.choices[0].message.content;
            } catch (error) {
                const status = error.response?.status;

                // If auth fails, mark provider as unavailable
                if (status === 401 || status === 403) {
                    console.error(`❌ ${providerName} authentication failed`);
                    delete this.providers[providerName];
                    throw error;
                }

                // Rate limit - try fallback model for Groq
                if (status === 429 && providerName === 'groq' && provider.fallbackModel) {
                    console.log('⚡ Switching to faster model due to rate limit');
                    provider.model = provider.fallbackModel;
                }

                if (attempt < 3) {
                    await this.delay(1000 * attempt);
                } else {
                    throw error;
                }
            }
        }
    }

    /**
     * Intelligent mock response system
     * Used when no AI providers are available
     */
    getMockResponse(messages) {
        const userMessages = messages.filter(m => m.role === 'user');
        const lastUserMessage = userMessages[userMessages.length - 1];
        const userText = lastUserMessage?.content?.toLowerCase() || '';
        const context = this.extractContext(messages);

        // Handle name introduction
        if (userText.includes('me llamo') || userText.includes('mi nombre es') || userText.includes('soy ')) {
            const nameMatch = userText.match(/(?:me llamo|mi nombre es|soy) (\w+)/i);
            if (nameMatch) {
                const name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
                return `¡Hola ${name}! 👋 ¡Qué gusto conocerte! Soy EDU, tu compañero de aprendizaje. ¿En qué tema te gustaría que trabajemos hoy? 📚`;
            }
        }

        // Name recall
        if (userText.includes('mi nombre') || userText.includes('como me llamo')) {
            if (context.userName) {
                return `¡Claro que te recuerdo, ${context.userName}! 😊 ¿En qué puedo ayudarte?`;
            }
            return `Hmm, no recuerdo que me hayas dicho tu nombre todavía. 🤔 ¿Cómo te llamas?`;
        }

        // Greetings
        if (userText.match(/^(hola|hi|hey|buenos días|buenas tardes|buenas noches)/i)) {
            return '¡Hola! 👋 Soy EDU, tu compañero de aprendizaje. Estoy aquí para ayudarte a entender mejor tus tareas sin darte las respuestas directamente. ¿Qué tema te gustaría explorar? 📚';
        }

        // Thanks
        if (userText.includes('gracias')) {
            return '¡De nada! 😊 Me alegra poder ayudarte. ¿Hay algo más que quieras aprender?';
        }

        // Mathematics
        if (userText.includes('matemát') || userText.includes('número') || userText.includes('suma') ||
            userText.includes('resta') || userText.includes('multiplica') || userText.includes('divide')) {
            return `¡Las matemáticas son fascinantes! 🔢 Cuéntame más sobre el problema que estás resolviendo. ¿Qué operación necesitas hacer? Te ayudaré a pensar paso a paso sin darte la respuesta directa.`;
        }

        // Fractions
        if (userText.includes('fraccion') || userText.includes('quebrado')) {
            return `Las fracciones representan partes de un todo 🍕. ¿Qué operación necesitas hacer con ellas? ¿Sumar, restar, o encontrar equivalencias? Cuéntame el problema y te haré preguntas para que tú mismo encuentres la solución.`;
        }

        // MCM/MCD
        if (userText.includes('mcm') || userText.includes('mcd') || userText.includes('mínimo común')) {
            return `¡Buen tema! Para encontrar el MCM o MCD, primero necesitas descomponer los números. ¿Con qué números estás trabajando? Te guiaré con preguntas para que descubras el procedimiento. 🔢`;
        }

        // Spanish/Language
        if (userText.includes('español') || userText.includes('lectura') || userText.includes('escrib') || userText.includes('gramática')) {
            return '¡El español es muy rico! 📚 ¿Estás trabajando con un texto, aprendiendo gramática o practicando escritura? Cuéntame más para guiarte con preguntas.';
        }

        // Science
        if (userText.includes('ciencia') || userText.includes('natura') || userText.includes('experiment')) {
            return '¡Ser científico es emocionante! 🔬 ¿Qué fenómeno o tema estás explorando? Te ayudaré a formar hipótesis y pensar como investigador.';
        }

        // History
        if (userText.includes('historia') || userText.includes('independencia') || userText.includes('revolución')) {
            return '¡La historia nos enseña mucho! 📜 ¿Qué época o evento estás estudiando? Te haré preguntas para que conectes los hechos y entiendas el porqué de las cosas.';
        }

        // Frustration detection
        if (userText === 'nada' || userText === 'no' || userText === 'no sé' || userText.length < 5) {
            return `¡No te desanimes! 💪 A veces los temas nuevos toman tiempo. ¿Qué parte específica no entiendes? Podemos ir paso a paso juntos.`;
        }

        // Default pedagogical response
        const responses = [
            '¡Interesante pregunta! 🌟 Para ayudarte mejor, cuéntame: ¿qué es lo que ya sabes sobre este tema?',
            '¡Vamos a explorarlo juntos! 🔍 ¿Puedes darme un ejemplo de lo que estás viendo en clase?',
            '¡Excelente curiosidad! 📚 ¿Qué es lo que más se te dificulta de este tema?',
            'Pensemos paso a paso. ✨ ¿Cuál crees que es el primer paso para resolver esto?'
        ];

        return responses[Math.floor(Math.random() * responses.length)];
    }

    extractContext(messages) {
        const context = { userName: null, subject: null };

        for (const msg of messages) {
            if (msg.role === 'user') {
                const text = msg.content.toLowerCase();
                const nameMatch = text.match(/(?:me llamo|mi nombre es|soy) (\w+)/i);
                if (nameMatch) {
                    context.userName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
                }
            }
        }

        return context;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Get current provider status
     */
    getStatus() {
        return {
            activeProvider: this.activeProvider,
            availableProviders: Object.keys(this.providers),
            isUsingMock: Object.keys(this.providers).length === 0
        };
    }
}

export const aiService = new AIService();
export default aiService;
