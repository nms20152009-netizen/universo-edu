import aiService from './aiService.js';
import Task from '../models/Task.js';

/**
 * Task Generator Service
 * Creates NEM-aligned project-based learning tasks
 * Designed for 6th grade students with low academic proficiency
 */
class TaskGeneratorService {
    constructor() {
        this.systemPrompt = `Eres un Asesor Técnico Pedagógico experto en la Nueva Escuela Mexicana (NEM) para 6° grado de primaria.

TU OBJETIVO: Diseñar Proyectos de Aula simplificados (Aprendizaje Basado en Proyectos) para alumnos que necesitan reforzamiento.

ESTRUCTURA OBLIGATORIA DEL PROYECTO:
1. Título Dinámico: Debe motivar al alumno (ej: "Detectives de Fracciones" en lugar de "Sumar Fracciones").
2. Contextualización: Relacionar con la realidad de una escuela pública en México (mercados, familia, comunidad).
3. Campo Formativo: Identificar claramente a cuál pertenece (Lenguajes, Saberes, Ética, o De lo Humano).
4. Ejes Articuladores: Mencionar al menos uno (ej: Inclusión, Pensamiento Crítico).

REQUISITOS PEDAGÓGICOS:
- Nivel cognitivo: Bajo-Medio (Andamiaje).
- Lenguaje: Directo, empático y en segunda persona ("Tú vas a...").
- Instrucciones: Secuenciadas cronológicamente y sin ambigüedades.

FORMATO DE RESPUESTA (Responde ÚNICAMENTE con este JSON):
{
  "title": "Nombre del Proyecto",
  "description": "Breve contexto del reto (NEM Style)",
  "learningObjective": "A qué aprendizaje esperado o PDA contribuye",
  "instructions": [
    {"step": 1, "text": "Instrucción de inicio (preparación)"},
    {"step": 2, "text": "Instrucción de desarrollo (acción)"},
    {"step": 3, "text": "Instrucción de cierre (reflexión/producto)"}
  ],
  "materials": ["Materiales reciclables o de papelería básica"],
  "duration": "minutos",
  "isCollaborative": boolean,
  "ejeArticulador": "Nombre del eje"
}`;
    }

    /**
     * Generate a new task based on subject and topic
     */
    async generateTask(subject, topic, weekNumber, createdBy = null) {
        const prompt = `Actividad para el campo formativo "${subject}" sobre el tema "${topic}".
Para alumnos de 6° grado grado que requieren apoyo constante.
Asegúrate de que el título sea creativo y el contexto sea mexicano.
Responde ÚNICAMENTE con el objeto JSON solicitado.`;

        const messages = [
            { role: 'system', content: this.systemPrompt },
            { role: 'user', content: prompt }
        ];

        const response = await aiService.chat(messages, {
            temperature: 0.7,
            max_tokens: 800
        });

        // Parse JSON response
        let taskData;
        try {
            // Extract JSON from response (handle possible markdown code blocks)
            const jsonMatch = response.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                taskData = JSON.parse(jsonMatch[0]);
            } else {
                throw new Error('No JSON found in response');
            }
        } catch (parseError) {
            console.error('Failed to parse task JSON:', parseError);
            throw new Error('Error al generar la tarea. Intenta de nuevo.');
        }

        // Calculate publish date (next weekday at 13:00)
        const publishDate = this.getNextPublishDate();

        // Create task in database
        const task = new Task({
            ...taskData,
            subject,
            weekNumber,
            publishDate,
            isPublished: false,
            difficulty: 'básico',
            createdBy
        });

        await task.save();
        return task;
    }

    /**
     * Get the next valid publish date (Mon-Fri at 13:00 Mexico City time)
     */
    getNextPublishDate() {
        const now = new Date();
        const mexicoTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Mexico_City' }));

        // Set to 13:00
        mexicoTime.setHours(13, 0, 0, 0);

        // If past 13:00 today, move to next day
        if (now > mexicoTime) {
            mexicoTime.setDate(mexicoTime.getDate() + 1);
        }

        // Skip weekends
        const day = mexicoTime.getDay();
        if (day === 0) mexicoTime.setDate(mexicoTime.getDate() + 1); // Sunday -> Monday
        if (day === 6) mexicoTime.setDate(mexicoTime.getDate() + 2); // Saturday -> Monday

        return mexicoTime;
    }

    /**
     * Get published tasks and notices for students
     */
    async getPublishedTasks(weekNumber = null) {
        const now = new Date();
        const query = {
            isPublished: true,
            publishDate: { $lte: now } // Extra safety layer
        };

        if (weekNumber) query.weekNumber = weekNumber;

        return Task.find(query)
            .sort({ publishDate: -1 })
            .limit(50);
    }

    /**
     * Get all tasks for admin
     */
    async getAllTasks(page = 1, limit = 10) {
        const skip = (page - 1) * limit;

        const [tasks, total] = await Promise.all([
            Task.find().sort({ createdAt: -1 }).skip(skip).limit(limit),
            Task.countDocuments()
        ]);

        return { tasks, total, page, pages: Math.ceil(total / limit) };
    }

    /**
     * Publish a task manually
     */
    async publishTask(taskId) {
        const task = await Task.findByIdAndUpdate(
            taskId,
            { isPublished: true, publishDate: new Date() },
            { new: true }
        );
        return task;
    }
}

export const taskGeneratorService = new TaskGeneratorService();
export default taskGeneratorService;
