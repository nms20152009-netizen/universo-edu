import aiService from './aiService.js';
import ChatSession from '../models/ChatSession.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Pedagogical Chatbot Service
 * Implements Socratic questioning methodology aligned with Nueva Escuela Mexicana
 * NEVER provides direct answers - guides students to discover concepts
 * Features: Memory, context awareness, adaptive difficulty
 */
class ChatbotService {
    constructor() {
        // Enhanced system prompt with HYBRID pedagogy (50% Socratic + 50% Agent)
        this.systemPrompt = `Eres "EDU", un asistente educativo amigable y motivador para estudiantes de 6° grado de primaria en México (11-12 años).

## 🎯 MODO DE INTERACCIÓN HÍBRIDO (50% Socrático + 50% Agente):

### 🎓 MODO SOCRÁTICO (para ejercicios y tareas):
Usa este modo cuando el estudiante pida ayuda con ejercicios, tareas o problemas específicos:
- Guía con preguntas para que descubra la respuesta por sí mismo
- Da pistas progresivas, nunca la solución directa
- Celebra el proceso de descubrimiento

**Indicadores para Modo Socrático:**
- "Ayúdame con este ejercicio/tarea/problema"
- "No sé cómo resolver..."
- "¿Cuál es la respuesta de...?"
- "Revisa mi tarea"

### 🤖 MODO AGENTE (para información y apoyo):
Usa este modo cuando el estudiante busque información, explicaciones o apoyo:
- Responde directamente con explicaciones claras
- Proporciona definiciones, datos y contexto
- Ofrece ejemplos prácticos y recursos
- Brinda apoyo emocional cuando hay frustración

**Indicadores para Modo Agente:**
- "¿Qué es...?" / "Explícame..."
- "¿Por qué...?" / "¿Cómo funciona...?"
- "Cuéntame sobre..." / "Dame información de..."
- Expresiones de frustración o confusión emocional
- Preguntas de cultura general

## ESTRATEGIAS PEDAGÓGICAS:
1. **Preguntas guía (Socrático)**: "¿Qué crees que pasaría si...?", "¿Cuál sería el primer paso?"
2. **Explicaciones claras (Agente)**: Cuando pregunten qué es algo, explica con ejemplos cotidianos
3. **Conexiones mexicanas**: Relaciona con mercado, cocina, fútbol, fiestas, comunidad
4. **Celebra el esfuerzo**: Reconoce avances y valida emociones
5. **Apoyo emocional**: Si detectas frustración, cambia a modo reconfortante

## MEMORIA Y CONTEXTO:
- Recuerda el nombre del estudiante y úsalo
- Mantén coherencia con toda la conversación
- Referencia temas anteriores cuando sea relevante
- Adapta tu estilo según el progreso del estudiante

## FORMATO DE RESPUESTA:
- 3-5 oraciones por respuesta (conciso pero completo)
- Usa emojis con moderación (🌟📚✨💪🔢🎯🤔)
- En modo Socrático: termina con una pregunta guía
- En modo Agente: termina con una invitación a preguntar más
- Lenguaje cálido y apropiado para niños de 11-12 años

## CAMPOS FORMATIVOS (Nueva Escuela Mexicana):
- **Lenguajes**: Español, lectura, escritura, comunicación
- **Saberes y Pensamiento Científico**: Matemáticas, ciencias naturales, lógica
- **Ética, Naturaleza y Sociedades**: Historia, geografía, civismo, valores
- **De lo Humano y lo Comunitario**: Arte, educación física, vida cotidiana

## EJEMPLOS:

### Modo Socrático (ejercicio):
Estudiante: "Ayúdame con 24 + 36"
EDU: "¡Claro! 🔢 Vamos paso a paso. ¿Qué pasa si primero sumamos las decenas? ¿Cuánto es 20 + 30?"

### Modo Agente (concepto):
Estudiante: "¿Qué es la fotosíntesis?"
EDU: "¡Gran pregunta! 🌱 La fotosíntesis es el proceso donde las plantas usan la luz del sol, agua y aire para crear su propio alimento. Es como si las plantas cocinaran usando la energía del sol. ¿Te gustaría saber más sobre cómo lo hacen?"

### Modo Agente (apoyo emocional):
Estudiante: "No entiendo nada, esto es muy difícil"
EDU: "Entiendo cómo te sientes, y está bien. 💪 Aprender cosas nuevas puede ser difícil al principio. ¿Qué te parece si empezamos desde lo más básico? Estoy aquí para ayudarte sin prisa."`;

        // Track conversation topics for better context
        this.topicKeywords = {
            'Lenguajes': ['español', 'lectura', 'escribir', 'cuento', 'poema', 'gramática', 'ortografía', 'acento', 'verbo'],
            'Saberes y Pensamiento Científico': ['matemát', 'número', 'suma', 'resta', 'multiplica', 'divide', 'fracción', 'mcm', 'mcd', 'ciencia', 'experimento'],
            'Ética, Naturaleza y Sociedades': ['historia', 'geografía', 'independencia', 'revolución', 'méxico', 'estado', 'país', 'civismo'],
            'De lo Humano y lo Comunitario': ['arte', 'música', 'dibujo', 'deporte', 'familia', 'comunidad']
        };
    }

    /**
     * Start or continue a chat session with full memory
     */
    async chat(sessionId, userMessage, subject = 'General') {
        // Get or create session from database
        let session = await ChatSession.findOne({ sessionId });

        if (!session) {
            session = new ChatSession({
                sessionId: sessionId || uuidv4(),
                subject: this.detectSubject(userMessage) || subject,
                messages: []
            });
        }

        // Update subject based on current message if more specific
        const detectedSubject = this.detectSubject(userMessage);
        if (detectedSubject && detectedSubject !== 'General') {
            session.subject = detectedSubject;
        }

        // Add user message to session
        session.messages.push({
            role: 'user',
            content: userMessage,
            timestamp: new Date()
        });

        // Build conversation context for AI
        // Include last 20 messages for enhanced memory while staying within limits
        const conversationHistory = session.messages.slice(-20).map(m => ({
            role: m.role,
            content: m.content
        }));

        // Extract any context clues (name, etc) from history
        const contextClues = this.extractContextClues(session.messages);

        // Build enhanced system prompt with context
        let enhancedSystemPrompt = this.systemPrompt;
        if (contextClues.studentName) {
            enhancedSystemPrompt += `\n\n## CONTEXTO DE ESTA CONVERSACIÓN:\n- El estudiante se llama: ${contextClues.studentName}`;
        }
        if (session.subject !== 'General') {
            enhancedSystemPrompt += `\n- Tema actual: ${session.subject}`;
        }

        const messages = [
            { role: 'system', content: enhancedSystemPrompt },
            ...conversationHistory
        ];

        // Get AI response
        const response = await aiService.chat(messages, {
            temperature: 0.8,
            max_tokens: 400
        });

        // Add assistant response to session
        session.messages.push({
            role: 'assistant',
            content: response,
            timestamp: new Date()
        });

        session.lastActivityAt = new Date();
        await session.save();

        return {
            sessionId: session.sessionId,
            response,
            messageCount: session.messages.length,
            subject: session.subject,
            aiProvider: aiService.getStatus().activeProvider
        };
    }

    /**
     * Detect subject from message content
     */
    detectSubject(message) {
        const text = message.toLowerCase();

        for (const [subject, keywords] of Object.entries(this.topicKeywords)) {
            for (const keyword of keywords) {
                if (text.includes(keyword)) {
                    return subject;
                }
            }
        }

        return null;
    }

    /**
     * Extract context clues from conversation history
     */
    extractContextClues(messages) {
        const context = {
            studentName: null,
            topics: new Set(),
            recentQuestions: []
        };

        for (const msg of messages) {
            if (msg.role === 'user') {
                const text = msg.content.toLowerCase();

                // Extract name
                const nameMatch = text.match(/(?:me llamo|mi nombre es|soy) (\w+)/i);
                if (nameMatch) {
                    context.studentName = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1);
                }

                // Track topics mentioned
                const subject = this.detectSubject(msg.content);
                if (subject) {
                    context.topics.add(subject);
                }
            }
        }

        return context;
    }

    /**
     * Get session history
     */
    async getHistory(sessionId) {
        const session = await ChatSession.findOne({ sessionId });
        if (!session) return null;

        return {
            sessionId: session.sessionId,
            subject: session.subject,
            messages: session.messages,
            startedAt: session.startedAt,
            messageCount: session.messages.length
        };
    }

    /**
     * Create a new session with welcome message
     */
    async createSession(subject = 'General') {
        const session = new ChatSession({
            sessionId: uuidv4(),
            subject,
            messages: [{
                role: 'assistant',
                content: '¡Hola! 👋 Soy EDU, tu compañero de aprendizaje. Estoy aquí para ayudarte de dos formas: si tienes un ejercicio o tarea, te guiaré con preguntas para que descubras la respuesta. Si quieres entender un concepto o necesitas información, te la explico directamente. 🌟\n\n¿Qué necesitas hoy? ¿Ayuda con una tarea o quieres aprender sobre algún tema?',
                timestamp: new Date()
            }]
        });

        await session.save();
        return session;
    }

    /**
     * Clear session to start fresh
     */
    async clearSession(sessionId) {
        await ChatSession.deleteOne({ sessionId });
        return { success: true };
    }

    /**
     * Get AI service status for debugging
     */
    getAIStatus() {
        return aiService.getStatus();
    }
}

export const chatbotService = new ChatbotService();
export default chatbotService;
