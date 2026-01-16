import cron from 'node-cron';
import Task from '../models/Task.js';
import Schedule from '../models/Schedule.js';
import Reading from '../models/Reading.js';
import { isUsingSupabase } from '../config/db.js';
import { TaskDAO, ScheduleDAO, ReadingDAO } from './supabaseDAL.js';
import taskGeneratorService from './taskGeneratorService.js';
import readingService from './readingService.js';

/**
 * Scheduler Service
 * Handles automatic task publishing and daily reading generation
 * Monday to Friday, Mexico City timezone
 */
class SchedulerService {
    constructor() {
        this.jobs = new Map();
        this.timezone = 'America/Mexico_City';
    }

    /**
     * Initialize the scheduler
     * Runs publication check every minute
     */
    init() {
        // Precise publication job: every minute
        const publishJob = cron.schedule('* * * * *', async () => {
            await this.processScheduledPublications();
        }, {
            timezone: this.timezone
        });

        this.jobs.set('publish', publishJob);
        console.log('✅ Precise task scheduler initialized (every minute, America/Mexico_City)');

        // Auto-generate tasks from AI schedules: 12:00 Mon-Fri
        const generateJob = cron.schedule('0 12 * * 1-5', async () => {
            console.log('🔄 Running scheduled AI task generation...');
            await this.generateFromSchedules();
        }, {
            timezone: this.timezone
        });

        this.jobs.set('generate', generateJob);
        console.log('✅ AI Task generator initialized (12:00 Mon-Fri, America/Mexico_City)');

        // Daily Reading Generation: 1:30 PM (13:30) Mon-Fri
        // We generate at 13:00 so it's ready by 13:30
        const readingJob = cron.schedule('0 13 * * 1-5', async () => {
            console.log('📖 Generating daily anti-bullying reading...');
            try {
                const reading = await readingService.generateDailyReading();
                console.log(`📖 Reading ready for 1:30 PM: ${reading.title}`);
            } catch (error) {
                console.error('❌ Failed to generate daily reading:', error);
            }
        }, {
            timezone: this.timezone
        });

        this.jobs.set('reading', readingJob);
        console.log('✅ Daily reading generator initialized (13:00 Mon-Fri, publishes at 13:30, America/Mexico_City)');
    }

    /**
     * Process all tasks/notices scheduled for now or earlier
     */
    async processScheduledPublications() {
        try {
            const now = new Date();
            let publishedCount = 0;

            if (isUsingSupabase()) {
                // Supabase Logic
                // Find scheduled items that are due
                const itemsToPublish = await TaskDAO.find({
                    status: 'scheduled',
                    publishDate: { $lte: now }
                });

                if (itemsToPublish.length > 0) {
                    console.log(`🕐 Real-time publisher: publishing ${itemsToPublish.length} tasks/notices`);

                    for (const item of itemsToPublish) {
                        await TaskDAO.findByIdAndUpdate(item._id, { status: 'published', isPublished: true });
                        console.log(`✅ Published [${item.type}]: ${item.title}`);
                    }
                    publishedCount += itemsToPublish.length;
                }

                // Also publish due readings
                const readingsToPublish = await ReadingDAO.find({
                    isPublished: false,
                    publishDate: { $lte: now }
                });

                if (readingsToPublish.length > 0) {
                    console.log(`📖 Real-time publisher: publishing ${readingsToPublish.length} readings`);
                    for (const reading of readingsToPublish) {
                        await ReadingDAO.findByIdAndUpdate(reading._id, { isPublished: true });
                        console.log(`✅ Published [reading]: ${reading.title}`);
                    }
                    publishedCount += readingsToPublish.length;
                }

                return publishedCount;

            } else {
                // Mongoose Logic
                // Find scheduled items that are due
                const itemsToPublish = await Task.find({
                    status: 'scheduled',
                    publishDate: { $lte: now }
                });

                if (itemsToPublish.length > 0) {
                    console.log(`🕐 Real-time publisher: publishing ${itemsToPublish.length} tasks/notices`);

                    for (const item of itemsToPublish) {
                        item.status = 'published';
                        item.isPublished = true;
                        await item.save();
                        console.log(`✅ Published [${item.type}]: ${item.title}`);
                    }
                    publishedCount += itemsToPublish.length;
                }

                // Also publish due readings
                const readingsToPublish = await Reading.find({
                    isPublished: false,
                    publishDate: { $lte: now }
                });

                if (readingsToPublish.length > 0) {
                    console.log(`📖 Real-time publisher: publishing ${readingsToPublish.length} readings`);
                    for (const reading of readingsToPublish) {
                        reading.isPublished = true;
                        await reading.save();
                        console.log(`✅ Published [reading]: ${reading.title}`);
                    }
                    publishedCount += readingsToPublish.length;
                }

                return publishedCount;
            }
        } catch (error) {
            console.error('❌ Error processing scheduled publications:', error);
        }
    }

    /**
     * Generate tasks from active schedules
     */
    async generateFromSchedules() {
        try {
            const now = new Date();
            const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
            const weekNumber = this.getWeekNumber(now);

            // Find active schedules for today
            let activeSchedules;

            if (isUsingSupabase()) {
                // ScheduleDAO.find accepts basic match object, may need custom logic for 'publishDays' (string match?)
                // Assuming 'publishDays' in Supabase is a text column, simplest equals match works if exact.
                // But dayOfWeek is 'monday', 'tuesday'. If DB has 'monday', good.
                // ScheduleDAO.find implementation: builder.match(query) -> eq checks.
                // ScheduleDAO.find(query) -> eq('is_active', query.isActive) only in current impl?
                // I need to check ScheduleDAO implementation. 
                // It only checks isActive. It returns ALL then map filters? No.
                // ScheduleDAO.find only implements 'isActive' filter in current code. 
                // I need to update ScheduleDAO to support more filters if I want to use it efficiently.
                // OR I just fetch all active and filter in memory since schedules are few.
                const allActive = await ScheduleDAO.find({ isActive: true });
                activeSchedules = allActive.filter(s =>
                    s.publishDays === dayOfWeek && s.weekNumber === weekNumber
                );
            } else {
                activeSchedules = await Schedule.find({
                    isActive: true,
                    publishDays: dayOfWeek,
                    weekNumber
                });
            }

            console.log(`📅 Found ${activeSchedules.length} active schedules for ${dayOfWeek}`);

            for (const schedule of activeSchedules) {
                try {
                    const task = await taskGeneratorService.generateTask(
                        schedule.subject,
                        schedule.topic,
                        weekNumber,
                        schedule.createdBy
                    );

                    if (isUsingSupabase()) {
                        await ScheduleDAO.findByIdAndUpdate(schedule._id, {
                            tasksGenerated: (schedule.tasksGenerated || 0) + 1
                        });
                    } else {
                        schedule.tasksGenerated += 1;
                        await schedule.save();
                    }

                    console.log(`✅ Generated task: ${task.title}`);
                } catch (genError) {
                    console.error(`❌ Failed to generate task for schedule ${schedule.name}:`, genError);
                }
            }
        } catch (error) {
            console.error('❌ Error in scheduled generation:', error);
        }
    }

    /**
     * Get ISO week number
     */
    getWeekNumber(date) {
        const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
        const dayNum = d.getUTCDay() || 7;
        d.setUTCDate(d.getUTCDate() + 4 - dayNum);
        const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
    }

    /**
     * Stop all jobs
     */
    stop() {
        for (const [name, job] of this.jobs) {
            job.stop();
            console.log(`⏹️ Stopped job: ${name}`);
        }
    }
}

export const schedulerService = new SchedulerService();
export default schedulerService;
