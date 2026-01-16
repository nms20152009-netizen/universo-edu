import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import Task from '../models/Task.js';
import { isUsingSupabase } from '../config/db.js';
import { UserDAO, TaskDAO } from './supabaseDAL.js';

/**
 * Initialize database with sample data if empty
 * Called automatically on server start
 */
export async function initializeDatabase() {
    try {
        const usingSupabase = isUsingSupabase();

        let userCount, taskCount;

        if (usingSupabase) {
            // Use Supabase DAL
            const users = await UserDAO.findOne({ role: 'admin' });
            userCount = users ? 1 : 0;
            const tasks = await TaskDAO.find({}, { limit: 1 });
            taskCount = tasks.length;
        } else {
            // Use Mongoose
            userCount = await User.countDocuments();
            taskCount = await Task.countDocuments();
        }

        if (userCount > 0 && taskCount > 0) {
            console.log('📦 Database already initialized');
            return;
        }

        console.log('🌱 Initializing database with sample data...');

        // Create admin user if not exists
        if (userCount === 0) {
            if (usingSupabase) {
                await UserDAO.create({
                    name: 'Administrador',
                    email: 'admin@universo-edu.mx',
                    password: 'admin1234',
                    role: 'admin'
                });
            } else {
                await User.create({
                    name: 'Administrador',
                    email: 'admin@universo-edu.mx',
                    password: 'admin1234',
                    role: 'admin'
                });
            }
            console.log('   ✅ Admin user created (admin@universo-edu.mx / admin1234)');
        }

        // Create sample tasks if not exists
        if (taskCount === 0) {
            let adminId;

            if (usingSupabase) {
                const admin = await UserDAO.findOne({ role: 'admin' });
                adminId = admin?.id;
            } else {
                const admin = await User.findOne({ role: 'admin' });
                adminId = admin?._id;
            }

            const sampleTasks = [
                {
                    title: 'Explorando las Fracciones Equivalentes',
                    description: 'Descubre cómo diferentes fracciones pueden representar la misma cantidad a través de actividades prácticas con materiales cotidianos.',
                    subject: 'Saberes y Pensamiento Científico',
                    learningObjective: 'Identificar y crear fracciones equivalentes utilizando representaciones gráficas y numéricas.',
                    instructions: [
                        { step: 1, text: 'Reúne los materiales: papel, tijeras y colores.' },
                        { step: 2, text: 'Dibuja un círculo y divídelo en 2 partes iguales. Colorea una mitad.' },
                        { step: 3, text: 'Dibuja otro círculo igual y divídelo en 4 partes. ¿Cuántas partes necesitas colorear para que sea igual a la mitad?' },
                        { step: 4, text: 'Repite con 8 partes. ¿Ves el patrón?' },
                        { step: 5, text: 'Comparte tus descubrimientos con un compañero.' }
                    ],
                    materials: ['Papel', 'Tijeras', 'Colores o crayones', 'Regla'],
                    duration: 45,
                    isCollaborative: true,
                    weekNumber: 1,
                    isPublished: true,
                    publishDate: new Date(),
                    createdBy: adminId
                },
                {
                    title: 'Poesía Mexicana: Creando Versos',
                    description: 'Conoce la belleza de la poesía mexicana y crea tus propios versos inspirados en tu comunidad.',
                    subject: 'Lenguajes',
                    learningObjective: 'Escribir poemas cortos utilizando elementos como rima, ritmo y figuras retóricas simples.',
                    instructions: [
                        { step: 1, text: 'Lee los poemas de ejemplo proporcionados en voz alta.' },
                        { step: 2, text: 'Identifica las palabras que riman al final de cada verso.' },
                        { step: 3, text: 'Piensa en algo de tu comunidad que te gustaría describir.' },
                        { step: 4, text: 'Escribe 4 versos sobre ese tema, intentando que rimen.' },
                        { step: 5, text: 'Lee tu poema frente a la clase.' }
                    ],
                    materials: ['Cuaderno', 'Lápiz', 'Antología de poemas mexicanos'],
                    duration: 60,
                    isCollaborative: false,
                    weekNumber: 1,
                    isPublished: true,
                    publishDate: new Date(),
                    createdBy: adminId
                },
                {
                    title: 'Héroes de la Independencia',
                    description: 'Investiga sobre los personajes clave de la Independencia de México y su impacto en nuestra historia.',
                    subject: 'Ética, Naturaleza y Sociedades',
                    learningObjective: 'Reconocer la importancia de los personajes históricos de la Independencia y su contribución a la formación de México.',
                    instructions: [
                        { step: 1, text: 'Elige un personaje de la Independencia: Hidalgo, Morelos, Josefa Ortiz o Allende.' },
                        { step: 2, text: 'Investiga: ¿Dónde nació? ¿Qué hizo? ¿Por qué es importante?' },
                        { step: 3, text: 'Dibuja a tu personaje con elementos que lo identifiquen.' },
                        { step: 4, text: 'Escribe 5 datos importantes sobre su vida.' },
                        { step: 5, text: 'Presenta tu personaje al grupo en forma de entrevista imaginaria.' }
                    ],
                    materials: ['Libros de texto', 'Internet (supervisado)', 'Hojas blancas', 'Colores'],
                    duration: 90,
                    isCollaborative: true,
                    weekNumber: 1,
                    isPublished: true,
                    publishDate: new Date(),
                    createdBy: adminId
                }
            ];

            if (usingSupabase) {
                for (const task of sampleTasks) {
                    await TaskDAO.create(task);
                }
            } else {
                await Task.insertMany(sampleTasks);
            }
            console.log(`   ✅ ${sampleTasks.length} sample tasks created`);
        }

        console.log('🎉 Database initialization complete!\n');

    } catch (error) {
        console.error('❌ Database initialization failed:', error.message);
    }
}

export default initializeDatabase;
