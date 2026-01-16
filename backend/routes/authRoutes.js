import express from 'express';
import User from '../models/User.js';
import { protect, generateToken } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   POST /api/auth/login
 * @desc    Admin login
 * @access  Public
 */
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                error: 'Por favor ingresa correo y contraseña'
            });
        }

        // Find user and include password for comparison
        const user = await User.findOne({ email }).select('+password');

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Credenciales inválidas'
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Cuenta desactivada. Contacta al administrador.'
            });
        }

        // Generate token
        const token = generateToken(user._id);

        res.json({
            success: true,
            token,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', protect, async (req, res) => {
    res.json({
        success: true,
        user: {
            id: req.user._id,
            email: req.user.email,
            name: req.user.name,
            role: req.user.role,
            school: req.user.school
        }
    });
});

/**
 * @route   POST /api/auth/register
 * @desc    Register new admin (protected - admin only)
 * @access  Private/Admin
 */
router.post('/register', protect, async (req, res, next) => {
    try {
        if (req.user.role !== 'admin') {
            return res.status(403).json({
                success: false,
                error: 'Solo administradores pueden crear usuarios'
            });
        }

        const { email, password, name, role, school } = req.body;

        const user = await User.create({
            email,
            password,
            name,
            role: role || 'teacher',
            school
        });

        res.status(201).json({
            success: true,
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
