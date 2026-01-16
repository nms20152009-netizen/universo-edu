import mongoose from 'mongoose';

const readingSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'El título es requerido'],
        trim: true
    },
    content: {
        type: String,
        required: [true, 'El contenido es requerido']
    },
    author: {
        type: String,
        default: 'Equipo UNIVERSO EDU'
    },
    readingTime: {
        type: Number,
        default: 15 // Minutes
    },
    topic: {
        type: String,
        required: true
    },
    publishDate: {
        type: Date,
        required: true,
        index: true
    },
    isPublished: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Ensure we only have one reading per day (at least logically)
readingSchema.index({ publishDate: 1 });

const Reading = mongoose.model('Reading', readingSchema);

export default Reading;
