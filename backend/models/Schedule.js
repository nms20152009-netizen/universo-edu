import mongoose from 'mongoose';

/**
 * Schedule Schema - Task publishing schedules
 * Configured by admin for weekly task generation
 */
const scheduleSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    subject: {
        type: String,
        required: true,
        enum: [
            'Lenguajes',
            'Saberes y Pensamiento Científico',
            'Ética, Naturaleza y Sociedades',
            'De lo Humano y lo Comunitario'
        ]
    },
    topic: {
        type: String,
        required: true,
        trim: true
    },
    weekNumber: {
        type: Number,
        required: true
    },
    year: {
        type: Number,
        required: true,
        default: () => new Date().getFullYear()
    },
    publishDays: [{
        type: String,
        enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday']
    }],
    publishTime: {
        type: String,
        default: '13:00',
        match: [/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
    },
    timezone: {
        type: String,
        default: 'America/Mexico_City'
    },
    isActive: {
        type: Boolean,
        default: true
    },
    tasksGenerated: {
        type: Number,
        default: 0
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Index for active schedules lookup
scheduleSchema.index({ weekNumber: 1, year: 1, isActive: 1 });

export const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
