import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * JWT Authentication Middleware
 * Protects admin-only routes
 */
export const protect = async (req, res, next) => {
    try {
        let token;

        // Check for token in Authorization header
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'No autorizado. Inicia sesión para continuar.'
            });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Get user from database
        const user = await User.findById(decoded.id);

        if (!user || !user.isActive) {
            return res.status(401).json({
                success: false,
                error: 'Usuario no encontrado o desactivado.'
            });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(401).json({
            success: false,
            error: 'Token inválido o expirado.'
        });
    }
};

/**
 * Admin role check
 */
export const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            error: 'Acceso denegado. Se requieren permisos de administrador.'
        });
    }
    next();
};

/**
 * Generate JWT token
 */
export const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: '24h'
    });
};

export default { protect, adminOnly, generateToken };
