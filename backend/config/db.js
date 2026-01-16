import mongoose from 'mongoose';

let mongod = null;

/**
 * Connect to MongoDB
 * - Uses MongoDB Atlas if MONGODB_URI is a valid Atlas connection string
 * - Falls back to MongoDB Memory Server for development if local MongoDB is not available
 */
export const connectDB = async () => {
    try {
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
                throw new Error('No MongoDB available. Please install MongoDB or provide a valid MONGODB_URI');
            }
        }

        const conn = await mongoose.connect(uri, {
            dbName: 'universo-edu'
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Create indexes
        await createIndexes();

        return conn;
    } catch (error) {
        console.error(`❌ MongoDB Connection Error: ${error.message}`);
        process.exit(1);
    }
};

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
    await mongoose.disconnect();
    if (mongod) {
        await mongod.stop();
        mongod = null;
    }
};

export default connectDB;

