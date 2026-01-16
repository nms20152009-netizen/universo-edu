import mongoose from 'mongoose';

/**
 * ChatSession Schema - Anonymous student interactions
 * Privacy-first: no personal data collected
 */
const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatSessionSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    messages: [messageSchema],
    subject: {
        type: String,
        enum: [
            'Lenguajes',
            'Saberes y Pensamiento Científico',
            'Ética, Naturaleza y Sociedades',
            'De lo Humano y lo Comunitario',
            'General'
        ],
        default: 'General'
    },
    taskReference: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Task'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    startedAt: {
        type: Date,
        default: Date.now
    },
    lastActivityAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Auto-expire sessions after 24 hours of inactivity
chatSessionSchema.index({ lastActivityAt: 1 }, { expireAfterSeconds: 86400 });

export const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
