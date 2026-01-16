import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { testSupabaseConnection } from './config/supabase.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
import schedulerService from './services/schedulerService.js';
import { initializeDatabase } from './services/initService.js';

// Routes
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import readingRoutes from './routes/readingRoutes.js';

// Load environment variables
dotenv.config();

// Set timezone
process.env.TZ = 'America/Mexico_City';

const app = express();

// CORS configuration
app.use(cors({
    origin: '*', // Allow all for now to solve production mismatch
    credentials: true,
    optionsSuccessStatus: 200
}));

// Body parser - increased limit for base64 image uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'UNIVERSO EDU API',
        timestamp: new Date().toISOString(),
        timezone: process.env.TZ
    });
});

// API Routes
// Middleware to ensure DB connection in serverless environment (Vercel)
app.use(async (req, res, next) => {
    if (process.env.VERCEL) {
        try {
            // Check if we need to initialize
            // Using a global check to avoid re-connecting on every hot lambda, 
            // though connectDB handles idempotency nicely usually.
            if (!global.isDbConnected) {
                console.log('⚡ Vercel: Initializing database connection...');
                await connectDB();
                if (process.env.SUPABASE_URL && process.env.SUPABASE_KEY) {
                    await testSupabaseConnection(); // Ensure supabase flag is set
                }
                global.isDbConnected = true;
            }
        } catch (error) {
            console.error('❌ Vercel DB Init Error:', error);
            return res.status(500).json({ error: 'Database connection failed' });
        }
    }
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/readings', readingRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Connect to MongoDB
        await connectDB();

        // Initialize database with sample data if empty
        await initializeDatabase();

        // Initialize scheduler
        schedulerService.init();

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`
╔════════════════════════════════════════════════╗
║         🎓 UNIVERSO EDU - Backend API          ║
╠════════════════════════════════════════════════╣
║  Server: Running in ${process.env.NODE_ENV || 'production'} mode           ║
║  Port:   ${PORT}                                  ║
║  URL:    http://localhost:${PORT}               ║
║  Status: Operational / NEM Aligned             ║
╚════════════════════════════════════════════════╝
`);
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
};

// Only start server contentiously if NOT on Vercel
if (!process.env.VERCEL) {
    startServer();
}

export default app;
