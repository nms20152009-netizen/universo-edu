import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

/**
 * User Schema - Admin users only
 * Students access anonymously (no registration required)
 */
const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, 'El correo electrónico es requerido'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Formato de correo inválido']
    },
    password: {
        type: String,
        required: [true, 'La contraseña es requerida'],
        minlength: [8, 'La contraseña debe tener al menos 8 caracteres'],
        select: false
    },
    name: {
        type: String,
        required: [true, 'El nombre es requerido'],
        trim: true
    },
    role: {
        type: String,
        enum: ['admin', 'teacher'],
        default: 'teacher'
    },
    school: {
        type: String,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    this.password = await bcrypt.hash(this.password, 12);
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);
export default User;
