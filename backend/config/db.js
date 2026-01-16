import mongoose from 'mongoose';
import { testSupabaseConnection } from './supabase.js';

let mongod = null;
let useSupabase = false;

/**
 * Connect to database
 * - Uses Supabase if SUPABASE_URL is configured (production)
 * - Falls back to MongoDB Memory Server for development if local MongoDB is not available
 */
export const connectDB = async () => {
    try {
        // Check if Supabase is configured (production mode)
        const supabaseUrl = process.env.SUPABASE_URL;
        const supabaseKey = process.env.SUPABASE_KEY;

        if (supabaseUrl && supabaseKey && process.env.NODE_ENV === 'production') {
            console.log('🔄 Attempting Supabase connection (production mode)...');
            const connected = await testSupabaseConnection();
            if (connected) {
                useSupabase = true;
                console.log('✅ Using Supabase for persistence');
                return { useSupabase: true };
            }
            console.log('⚠️ Supabase connection failed, falling back to MongoDB...');
        }

        let uri = process.env.MONGODB_URI;

        // Check if URI is for Atlas or valid MongoDB
        const isAtlasUri = uri && uri.includes('mongodb+srv://');
        const isLocalUri = uri && uri.includes('localhost');

        // If local URI but no MongoDB installed, use memory server
        if (isLocalUri || !uri) {
            console.log('🧪 Attempting to use MongoDB Memory Server for development...');
            try {
                const { MongoMemoryServer } = await import('mongodb-memory-server');
                mongod = await MongoMemoryServer.create();
                uri = mongod.getUri();
                console.log('✅ MongoDB Memory Server started successfully');
            } catch (memError) {
                console.error('❌ Could not start MongoDB Memory Server:', memError.message);

                // Last resort: try Supabase even in dev mode
                if (supabaseUrl && supabaseKey) {
                    console.log('🔄 Trying Supabase as fallback...');
                    const connected = await testSupabaseConnection();
                    if (connected) {
                        useSupabase = true;
                        console.log('✅ Using Supabase for persistence (fallback)');
                        return { useSupabase: true };
                    }
                }

                throw new Error('No database available. Please configure SUPABASE_URL/SUPABASE_KEY or provide a valid MONGODB_URI');
            }
        }

        const conn = await mongoose.connect(uri, {
            dbName: 'universo-edu'
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Create indexes
        await createIndexes();

        return { useSupabase: false, connection: conn };
    } catch (error) {
        console.error(`❌ Database Connection Error: ${error.message}`);
        process.exit(1);
    }
};

/**
 * Check if using Supabase
 */
export const isUsingSupabase = () => useSupabase;

/**
 * Create database indexes for optimal performance
 */
const createIndexes = async () => {
    try {
        const User = mongoose.model('User');
        await User.createIndexes();
    } catch (e) {
        // Model may not be loaded yet, that's ok
    }
};

/**
 * Disconnect and cleanup
 */
export const disconnectDB = async () => {
    if (!useSupabase) {
        await mongoose.disconnect();
    }
    if (mongod) {
        await mongod.stop();
        mongod = null;
    }
};

export default connectDB;
