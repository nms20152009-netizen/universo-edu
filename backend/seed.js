import mongoose from 'mongoose';
import { connectDB, disconnectDB } from './config/db.js';
import dotenv from 'dotenv';


// Load environment variables
dotenv.config();

// Import models
import User from './models/User.js';
import Task from './models/Task.js';

/**
 * Seed initial data for UNIVERSO EDU
 * Creates admin user and sample tasks
 */
async function seedDatabase() {
    console.log('🌱 Starting database seed...\n');

    try {
        // Connect to database
        await connectDB();

        // Clear existing data (optional - comment out in production)
        console.log('🧹 Clearing existing data...');
        await User.deleteMany({});
        await Task.deleteMany({});

        // Create admin user (password is hashed by the model's pre-save hook)
        console.log('👤 Creating admin user...');
        const admin = await User.create({
            name: 'Administrador',
            email: 'admin@universo-edu.mx',
            password: 'admin1234', // min 8 chars, model will hash it
            role: 'admin'
        });
        console.log(`   ✅ Admin created: ${admin.email}`);

        // Create sample tasks
        console.log('📋 Creating sample tasks...');

        const sampleTasks = [
            {
                title: 'Explorando las Fracciones Equivalentes',
                description: 'Descubre cómo diferentes fracciones pueden representar la misma cantidad a través de actividades prácticas con materiales cotidianos.',
                subject: 'Saberes y Pensamiento Científico',
                topic: 'Fracciones Equivalentes',
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
                createdBy: admin._id
            },
            {
                title: 'Poesía Mexicana: Creando Versos',
                description: 'Conoce la belleza de la poesía mexicana y crea tus propios versos inspirados en tu comunidad.',
                subject: 'Lenguajes',
                topic: 'Poesía y Expresión Escrita',
                learningObjective: 'Escribir poemas cortos utilizando elementos como rima, ritmo y figuras retóricas simples.',
                instructions: [
                    { step: 1, text: 'Lee los poemas de ejemplo proporcionados en voz alta.' },
                    { step: 2, text: 'Identifica las palabras que riman al final de cada verso.' },
                    { step: 3, text: 'Piensa en algo de tu comunidad que te gustaría describir.' },
                    { step: 4, text: 'Escribe 4 versos sobre ese tema, intentando que rimen.' },
                    { step: 5, text: 'Lee tu poema frente a la clase.' }
                ],
                materials: ['Cuaderno', 'Lápiz', 'Antología de poemas mexicanos (proporcionada)'],
                duration: 60,
                isCollaborative: false,
                weekNumber: 1,
                isPublished: true,
                publishDate: new Date(),
                createdBy: admin._id
            },
            {
                title: 'Héroes de la Independencia',
                description: 'Investiga sobre los personajes clave de la Independencia de México y su impacto en nuestra historia.',
                subject: 'Ética, Naturaleza y Sociedades',
                topic: 'Independencia de México',
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
                createdBy: admin._id
            },
            {
                title: 'Arte Colaborativo: Mural Comunitario',
                description: 'Trabaja en equipo para crear un mural que represente los valores de tu comunidad escolar.',
                subject: 'De lo Humano y lo Comunitario',
                topic: 'Arte y Comunidad',
                learningObjective: 'Desarrollar habilidades de trabajo en equipo y expresión artística para representar valores comunitarios.',
                instructions: [
                    { step: 1, text: 'En equipo, discutan qué valores son importantes en su escuela.' },
                    { step: 2, text: 'Hagan una lluvia de ideas sobre imágenes que representen esos valores.' },
                    { step: 3, text: 'Dividan el espacio del papel en secciones, una por cada miembro.' },
                    { step: 4, text: 'Cada quien dibuja su parte, asegurándose de que conecte con las demás.' },
                    { step: 5, text: 'Presenten su mural explicando el significado de cada elemento.' }
                ],
                materials: ['Papel craft grande', 'Pinturas o marcadores', 'Pinceles', 'Cinta adhesiva'],
                duration: 120,
                isCollaborative: true,
                weekNumber: 2,
                isPublished: false,
                publishDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
                createdBy: admin._id
            }
        ];

        for (const taskData of sampleTasks) {
            const task = await Task.create(taskData);
            console.log(`   ✅ Task created: ${task.title}`);
        }

        console.log('\n🎉 Database seeded successfully!\n');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📧 Admin Login:');
        console.log('   Email: admin@universo-edu.mx');
        console.log('   Password: admin1234');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log(`📋 Tasks created: ${sampleTasks.length}`);
        console.log(`   Published: ${sampleTasks.filter(t => t.isPublished).length}`);
        console.log(`   Draft: ${sampleTasks.filter(t => !t.isPublished).length}`);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    } catch (error) {
        console.error('❌ Seed failed:', error.message);
        console.error(error);
    } finally {
        await disconnectDB();
        process.exit(0);
    }
}

// Run seeder
seedDatabase();
