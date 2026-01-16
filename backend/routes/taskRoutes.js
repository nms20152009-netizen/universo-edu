import express from 'express';
import taskGeneratorService from '../services/taskGeneratorService.js';
import schedulerService from '../services/schedulerService.js';
import { protect } from '../middleware/authMiddleware.js';
import Task from '../models/Task.js';

const router = express.Router();

/**
 * @route   GET /api/tasks
 * @desc    Get published tasks for students
 * @access  Public (students)
 */
router.get('/', async (req, res, next) => {
    try {
        // Just-in-time publication check
        await schedulerService.processScheduledPublications();

        const { week } = req.query;
        const tasks = await taskGeneratorService.getPublishedTasks(week ? parseInt(week) : null);

        res.json({
            success: true,
            count: tasks.length,
            tasks
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/tasks/:id
 * @desc    Get single task by ID
 * @access  Public (students)
 */
router.get('/:id', async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Tarea no encontrada'
            });
        }

        // Only return if published (or if admin)
        if (!task.isPublished) {
            return res.status(404).json({
                success: false,
                error: 'Tarea no disponible'
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/tasks/generate
 * @desc    Generate a new task (admin only)
 * @access  Private
 */
router.post('/generate', protect, async (req, res, next) => {
    try {
        const { subject, topic, weekNumber } = req.body;

        if (!subject || !topic) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere materia y tema'
            });
        }

        const currentWeek = weekNumber || getWeekNumber(new Date());

        const task = await taskGeneratorService.generateTask(
            subject,
            topic,
            currentWeek,
            req.user._id
        );

        res.status(201).json({
            success: true,
            task
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/tasks/:id/publish
 * @desc    Publish a task (admin only)
 * @access  Private
 */
router.put('/:id/publish', protect, async (req, res, next) => {
    try {
        const task = await taskGeneratorService.publishTask(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Tarea no encontrada'
            });
        }

        res.json({
            success: true,
            task
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete a task (admin only)
 * @access  Private
 */
router.delete('/:id', protect, async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Tarea no encontrada'
            });
        }

        res.json({
            success: true,
            message: 'Tarea eliminada'
        });
    } catch (error) {
        next(error);
    }
});

// Helper function
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}

export default router;
