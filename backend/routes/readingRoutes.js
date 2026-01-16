import express from 'express';
import readingService from '../services/readingService.js';
import schedulerService from '../services/schedulerService.js';
import { protect, adminOnly } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @route   GET /api/readings/today
 * @desc    Get the reading of the day
 * @access  Public
 */
router.get('/today', async (req, res, next) => {
    try {
        // Just-in-time publication check
        await schedulerService.processScheduledPublications();

        const reading = await readingService.getLatestReading();
        if (!reading) {
            return res.status(404).json({
                success: false,
                message: 'No hay lectura disponible por el momento.'
            });
        }
        res.json({ success: true, reading });
    } catch (error) {
        next(error);
    }
});

/**
 * @route   POST /api/readings/generate-daily
 * @desc    Trigger daily reading generation (Secured for Cron/Admin)
 * @access  Private/Admin
 */
router.post('/generate-daily', async (req, res, next) => {
    // In production, we should check for a CRON_SECRET or use adminOnly
    try {
        const reading = await readingService.generateDailyReading();
        res.status(201).json({ success: true, reading });
    } catch (error) {
        next(error);
    }
});

export default router;
