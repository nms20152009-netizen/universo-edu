import aiService from './aiService.js';
import Reading from '../models/Reading.js';

class ReadingService {
    constructor() {
        // Updated prompt for anti-bullying and violence reflection stories for 6th graders
        this.systemPrompt = `Eres un experto en pedagogía y literatura infantil mexicana especializado en educación socioemocional. 
Tu objetivo es escribir una "Lectura del Día" para estudiantes de sexto grado de primaria (11-12 años) enfocada en la REFLEXIÓN sobre la violencia y el acoso escolar.

TEMA CENTRAL:
Todas las lecturas deben abordar temas de:
- Prevención del acoso escolar (bullying)
- Resolución pacífica de conflictos
- Empatía y respeto hacia los demás
- El valor de la inclusión y la diversidad
- Cómo ser un "upstander" (quien defiende a otros) en lugar de un "bystander" (espectador pasivo)
- Las consecuencias emocionales de la violencia
- Historias de redención y cambio positivo
- La importancia de comunicar con adultos de confianza

REGLAS DE CONTENIDO:
1. LONGITUD: El texto debe ser extenso (entre 1500 y 2000 palabras). Narra con profundidad emocional.
2. ESTRUCTURA: Usa subtítulos llamativos (HTML <h3>) para dividir el texto. Usa párrafos cortos (HTML <p>).
3. TONO: Empático, reflexivo e inspirador. Evita ser punitivo o moralizante de forma negativa.
4. FORMATO: Incluye siempre una sección final de "Reflexión" con 3-4 preguntas para que los estudiantes piensen.
5. PROTAGONISTAS: Usa personajes con los que los estudiantes mexicanos puedan identificarse.

FORMATO DE SALIDA (JSON ÚNICAMENTE):
{
  "title": "Un título cautivador relacionado con el tema",
  "content": "Contenido completo en HTML (solo p, h3, b, i, ul, li)",
  "author": "Nombre del autor ficticio mexicano",
  "topic": "Convivencia Escolar"
}`;
    }

    async generateDailyReading() {
        // Find if we already have a reading for today (1:30 PM)
        const targetDate = new Date();
        targetDate.setHours(13, 30, 0, 0);

        const todayStart = new Date(targetDate);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(targetDate);
        todayEnd.setHours(23, 59, 59, 999);

        const existing = await Reading.findOne({
            publishDate: {
                $gte: todayStart,
                $lte: todayEnd
            }
        });

        if (existing) {
            console.log('📅 Reading for today already exists:', existing.title);
            return existing;
        }

        console.log('🤖 Generating daily anti-bullying reading...');

        // Anti-bullying and violence prevention topics
        const topics = [
            'La historia de Sofía: cuando el silencio duele más que las palabras',
            'Los valientes de corazón: cómo Mario aprendió a defender a sus compañeros',
            'El diario secreto de Miguel: las cicatrices invisibles del bullying',
            'La fuerza de la amistad: cuando Andrea encontró aliados inesperados',
            'El cambio de Rodrigo: de agresor a protector',
            'Las palabras que no se borran: la historia de Valentina',
            'Juntos somos más fuertes: el día que la clase 6-B dijo basta',
            'El poder de escuchar: cuando la maestra descubrió lo que pasaba en el recreo',
            'No estás solo: la red de apoyo de Carlos',
            'El espejo roto: entendiendo por qué algunos niños lastiman a otros',
            'La cadena de bondad: un acto pequeño que cambió todo',
            'Cuando las diferencias nos hacen únicos: la historia de Lupita'
        ];

        const randomTopic = topics[Math.floor(Math.random() * topics.length)];

        const prompt = `Escribe una lectura reflexiva completa sobre: "${randomTopic}". 
Esta historia debe hacer reflexionar a estudiantes de sexto grado sobre la violencia escolar y el acoso.
Incluye: desarrollo narrativo profundo, emociones de los personajes, consecuencias reales, y un final esperanzador que muestre que el cambio es posible.
Al final incluye una sección de "Para reflexionar" con preguntas provocadoras.
Mínimo 1500 palabras.`;

        const messages = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt }
        ];

        try {
            const response = await aiService.chat(messages, {
                temperature: 0.85,
                max_tokens: 4000
            });

            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (!jsonMatch) throw new Error('Invalid AI response format');

            const readingData = JSON.parse(jsonMatch[0]);

            const reading = new Reading({
                ...readingData,
                publishDate: targetDate,
                readingTime: 15,
                isPublished: false // Will be published by scheduler at 1:30 PM
            });

            await reading.save();
            console.log(`✅ Daily anti-bullying reading generated: ${reading.title}`);
            return reading;

        } catch (error) {
            console.error('❌ Error generating reading:', error);
            throw error;
        }
    }

    async getLatestReading() {
        const now = new Date();
        return Reading.findOne({
            isPublished: true,
            publishDate: { $lte: now }
        }).sort({ publishDate: -1 });
    }
}

export const readingService = new ReadingService();
export default readingService;
