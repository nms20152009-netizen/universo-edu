/**
 * Centralized Error Handler
 * Provides consistent error responses
 */
export const errorHandler = (err, req, res, next) => {
    console.error('Error:', err);

    // Default error
    let error = {
        success: false,
        error: err.message || 'Error interno del servidor'
    };
    let statusCode = err.statusCode || 500;

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const messages = Object.values(err.errors).map(e => e.message);
        error.error = messages.join(', ');
        statusCode = 400;
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        error.error = 'Este registro ya existe.';
        statusCode = 400;
    }

    // Mongoose cast error (invalid ObjectId)
    if (err.name === 'CastError') {
        error.error = 'ID inválido.';
        statusCode = 400;
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        error.error = 'Token inválido.';
        statusCode = 401;
    }

    if (err.name === 'TokenExpiredError') {
        error.error = 'Token expirado. Inicia sesión nuevamente.';
        statusCode = 401;
    }

    res.status(statusCode).json(error);
};

/**
 * Not Found Handler
 */
export const notFound = (req, res, next) => {
    res.status(404).json({
        success: false,
        error: `Ruta no encontrada: ${req.originalUrl}`
    });
};

export default { errorHandler, notFound };
