import express from 'express';
import { protect, adminOnly } from '../middleware/authMiddleware.js';
import taskGeneratorService from '../services/taskGeneratorService.js';
import schedulerService from '../services/schedulerService.js';
import Schedule from '../models/Schedule.js';
import User from '../models/User.js';
import Task from '../models/Task.js';

const router = express.Router();

// All admin routes require authentication
router.use(protect);

/**
 * @route   GET /api/admin/tasks
 * @desc    Get all tasks (with pagination)
 * @access  Private
 */
router.get('/tasks', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await taskGeneratorService.getAllTasks(page, limit);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/schedules
 * @desc    Get all schedules
 * @access  Private
 */
router.get('/schedules', async (req, res, next) => {
    try {
        const schedules = await Schedule.find()
            .populate('createdBy', 'name email')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: schedules.length,
            schedules
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/schedules
 * @desc    Create a new schedule
 * @access  Private
 */
router.post('/schedules', async (req, res, next) => {
    try {
        const { name, subject, topic, weekNumber, publishDays, publishTime } = req.body;

        if (!subject || !topic || !weekNumber) {
            return res.status(400).json({
                success: false,
                error: 'Se requiere materia, tema y semana'
            });
        }

        const schedule = await Schedule.create({
            name: name || `${subject} - Semana ${weekNumber}`,
            subject,
            topic,
            weekNumber,
            publishDays: publishDays || ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
            publishTime: publishTime || '13:00',
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            schedule
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/admin/schedules/:id
 * @desc    Update a schedule
 * @access  Private
 */
router.put('/schedules/:id', async (req, res, next) => {
    try {
        const schedule = await Schedule.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        if (!schedule) {
            return res.status(404).json({
                success: false,
                error: 'Programación no encontrada'
            });
        }

        res.json({
            success: true,
            schedule
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/admin/tasks
 * @desc    Create a task or notice manually
 * @access  Private
 */
router.post('/tasks', async (req, res, next) => {
    try {
        const { type, title, content, subject, multimedia, publishDate, status, weekNumber } = req.body;

        const task = await Task.create({
            type: type || 'task',
            title,
            content,
            subject,
            multimedia,
            publishDate: publishDate || new Date(),
            status: status || 'published',
            isPublished: status === 'published',
            weekNumber,
            createdBy: req.user._id
        });

        res.status(201).json({
            success: true,
            task
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/content
 * @desc    Get all content (tasks and notices) with pagination
 * @access  Private
 */
router.get('/content', async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [items, total] = await Promise.all([
            Task.find()
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('createdBy', 'name'),
            Task.countDocuments()
        ]);

        res.json({
            success: true,
            items,
            pagination: {
                total,
                page,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   PUT /api/admin/tasks/:id
 * @desc    Update a task or notice
 * @access  Private
 */
router.put('/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findByIdAndUpdate(
            req.params.id,
            { ...req.body, isPublished: req.body.status === 'published' },
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Contenido no encontrado'
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
 * @route   DELETE /api/admin/tasks/:id
 * @desc    Delete a task or notice
 * @access  Private
 */
router.delete('/tasks/:id', async (req, res, next) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Contenido no encontrado'
            });
        }

        res.json({
            success: true,
            message: 'Eliminado correctamente'
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/stats
 * @desc    Get dashboard statistics
 * @access  Private
 */
router.get('/stats', async (req, res, next) => {
    try {
        const [
            totalTasks,
            publishedTasks,
            activeSchedules,
            totalUsers
        ] = await Promise.all([
            Task.countDocuments(),
            Task.countDocuments({ isPublished: true }),
            Schedule.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: true })
        ]);

        res.json({
            success: true,
            stats: {
                totalTasks,
                publishedTasks,
                pendingTasks: totalTasks - publishedTasks,
                activeSchedules,
                totalUsers
            }
        });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   GET /api/admin/trigger-scheduler
 * @desc    Trigger the publication scheduler (Internal/Vercel Cron)
 * @access  Public (Should be protected by secret in prod)
 */
router.get('/trigger-scheduler', async (req, res, next) => {
    try {
        // Simple security check (optional - can be enhanced with CRON_SECRET)
        console.log('🔄 Cron Trigger: Processing scheduled items...');
        const publishedCount = await schedulerService.processScheduledPublications();
        res.json({
            success: true,
            publishedCount,
            timestamp: new Date().toISOString()
        });
    } catch (error) {
        console.error('❌ Cron Trigger Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

export default router;
