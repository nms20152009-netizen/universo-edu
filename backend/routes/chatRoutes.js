import express from 'express';
import chatbotService from '../services/chatbotService.js';

const router = express.Router();

/**
 * @route   POST /api/chat/message
 * @desc    Send a message to the pedagogical chatbot
 * @access  Public (students)
 */
router.post('/message', async (req, res, next) => {
    try {
        const { sessionId, message, subject } = req.body;

        if (!message?.trim()) {
            return res.status(400).json({
                success: false,
                error: 'El mensaje no puede estar vacío'
            });
        }

        // Limit message length for safety
        const sanitizedMessage = message.trim().slice(0, 1000);

        const result = await chatbotService.chat(sessionId, sanitizedMessage, subject);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Chat error:', error);
        res.status(500).json({
            success: false,
            error: 'Error al procesar tu mensaje. Por favor intenta de nuevo.',
            response: '😔 Lo siento, tuve un problema técnico. ¿Puedes intentar de nuevo?'
        });
    }
});

/**
 * @route   POST /api/chat/session
 * @desc    Create a new chat session
 * @access  Public (students)
 */
router.post('/session', async (req, res, next) => {
    try {
        const { subject } = req.body;
        const session = await chatbotService.createSession(subject);

        res.status(201).json({
            success: true,
            sessionId: session.sessionId,
            subject: session.subject,
            messages: session.messages
        });
    } catch (error) {
        console.error('Session creation error:', error);
        next(error);
    }
});

/**
 * @route   GET /api/chat/history/:sessionId
 * @desc    Get chat history for a session
 * @access  Public (students)
 */
router.get('/history/:sessionId', async (req, res, next) => {
    try {
        const history = await chatbotService.getHistory(req.params.sessionId);

        if (!history) {
            return res.status(404).json({
                success: false,
                error: 'Sesión no encontrada'
            });
        }

        res.json({
            success: true,
            ...history
        });
    } catch (error) {
        console.error('History fetch error:', error);
        next(error);
    }
});

/**
 * @route   DELETE /api/chat/session/:sessionId
 * @desc    Clear a chat session (start fresh)
 * @access  Public (students)
 */
router.delete('/session/:sessionId', async (req, res, next) => {
    try {
        await chatbotService.clearSession(req.params.sessionId);
        res.json({
            success: true,
            message: 'Sesión eliminada'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/chat/status
 * @desc    Get AI service status (for debugging)
 * @access  Public
 */
router.get('/status', (req, res) => {
    const status = chatbotService.getAIStatus();
    res.json({
        success: true,
        ...status,
        features: {
            interactionMode: 'hybrid',
            socraticMethod: true,
            agentMode: true,
            memoryEnabled: true,
            subjectDetection: true,
            maxHistoryMessages: 20
        }
    });
});

export default router;
