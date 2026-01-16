/**
 * Supabase Data Access Layer
 * Provides Mongoose-compatible interfaces for Supabase operations
 */
import supabase from '../config/supabase.js';
import bcryptjs from 'bcryptjs';

// ============== USER OPERATIONS ==============
export const UserDAO = {
    async findOne(query) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .match(query)
            .single();

        if (error && error.code !== 'PGRST116') return null;
        return data ? { ...data, _id: data.id } : null;
    },

    async findById(id) {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? { ...data, _id: data.id } : null;
    },

    async create(userData) {
        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(userData.password, salt);

        const { data, error } = await supabase
            .from('users')
            .insert({
                name: userData.name,
                email: userData.email,
                password: hashedPassword,
                role: userData.role || 'user'
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { ...data, _id: data.id };
    },

    async comparePassword(plainPassword, hashedPassword) {
        return bcryptjs.compare(plainPassword, hashedPassword);
    }
};

// ============== TASK OPERATIONS ==============
export const TaskDAO = {
    async find(query = {}, options = {}) {
        let queryBuilder = supabase.from('tasks').select('*');

        if (query.isPublished !== undefined) {
            queryBuilder = queryBuilder.eq('is_published', query.isPublished);
        }
        if (query.publishDate) {
            if (query.publishDate.$lte) {
                queryBuilder = queryBuilder.lte('publish_date', query.publishDate.$lte.toISOString());
            }
        }
        if (options.sort) {
            const [field, order] = Object.entries(options.sort)[0];
            const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
            queryBuilder = queryBuilder.order(snakeField, { ascending: order === 1 });
        }
        if (options.limit) {
            queryBuilder = queryBuilder.limit(options.limit);
        }

        const { data, error } = await queryBuilder;
        if (error) throw new Error(error.message);
        return data.map(t => ({ ...t, _id: t.id }));
    },

    async findById(id) {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', id)
            .single();

        if (error) return null;
        return data ? { ...data, _id: data.id } : null;
    },

    async create(taskData) {
        const { data, error } = await supabase
            .from('tasks')
            .insert({
                title: taskData.title,
                description: taskData.description,
                subject: taskData.subject,
                topic: taskData.topic || null,
                learning_objective: taskData.learningObjective || null,
                instructions: taskData.instructions || [],
                materials: taskData.materials || [],
                multimedia: taskData.multimedia || [],
                duration: taskData.duration || null,
                is_collaborative: taskData.isCollaborative || false,
                week_number: taskData.weekNumber || null,
                is_published: taskData.isPublished || false,
                publish_date: taskData.publishDate || null,
                created_by: taskData.createdBy,
                type: taskData.type || 'task',
                content: taskData.content || null,
                status: taskData.status || 'draft'
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { ...data, _id: data.id };
    },

    async findByIdAndUpdate(id, updateData) {
        const snakeCaseData = {};
        for (const [key, value] of Object.entries(updateData)) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            snakeCaseData[snakeKey] = value;
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(snakeCaseData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { ...data, _id: data.id };
    },

    async findByIdAndDelete(id) {
        const { error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', id);

        if (error) throw new Error(error.message);
        return true;
    },

    async updateMany(query, updateData) {
        let queryBuilder = supabase.from('tasks').update(updateData);

        if (query.isPublished !== undefined) {
            queryBuilder = queryBuilder.eq('is_published', query.isPublished);
        }
        if (query.publishDate) {
            if (query.publishDate.$lte) {
                queryBuilder = queryBuilder.lte('publish_date', query.publishDate.$lte.toISOString());
            }
        }

        const { data, error } = await queryBuilder.select();
        if (error) throw new Error(error.message);
        return { modifiedCount: data.length };
    }
};

// ============== SCHEDULE OPERATIONS ==============
export const ScheduleDAO = {
    async find(query = {}) {
        let queryBuilder = supabase.from('schedules').select('*');

        if (query.isActive !== undefined) {
            queryBuilder = queryBuilder.eq('is_active', query.isActive);
        }

        const { data, error } = await queryBuilder;
        if (error) throw new Error(error.message);
        return data.map(s => ({ ...s, _id: s.id }));
    },

    async create(scheduleData) {
        const { data, error } = await supabase
            .from('schedules')
            .insert({
                name: scheduleData.name,
                cron_expression: scheduleData.cronExpression,
                task_type: scheduleData.taskType,
                is_active: scheduleData.isActive ?? true,
                last_run: scheduleData.lastRun || null,
                next_run: scheduleData.nextRun || null
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { ...data, _id: data.id };
    },

    async findByIdAndUpdate(id, updateData) {
        const snakeCaseData = {};
        for (const [key, value] of Object.entries(updateData)) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            snakeCaseData[snakeKey] = value;
        }

        const { data, error } = await supabase
            .from('schedules')
            .update(snakeCaseData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { ...data, _id: data.id };
    }
};

// ============== READING OPERATIONS ==============
export const ReadingDAO = {
    async find(query = {}, options = {}) {
        let queryBuilder = supabase.from('readings').select('*');

        if (query.isPublished !== undefined) {
            queryBuilder = queryBuilder.eq('is_published', query.isPublished);
        }
        if (options.sort) {
            const [field, order] = Object.entries(options.sort)[0];
            const snakeField = field.replace(/([A-Z])/g, '_$1').toLowerCase();
            queryBuilder = queryBuilder.order(snakeField, { ascending: order === 1 });
        }
        if (options.limit) {
            queryBuilder = queryBuilder.limit(options.limit);
        }

        const { data, error } = await queryBuilder;
        if (error) throw new Error(error.message);
        return data.map(r => ({ ...r, _id: r.id }));
    },

    async create(readingData) {
        const { data, error } = await supabase
            .from('readings')
            .insert({
                title: readingData.title,
                content: readingData.content,
                theme: readingData.theme || null,
                reflection_questions: readingData.reflectionQuestions || [],
                is_published: readingData.isPublished || false,
                publish_date: readingData.publishDate || null,
                created_by: readingData.createdBy
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { ...data, _id: data.id };
    }
};

// ============== CHAT SESSION OPERATIONS ==============
export const ChatSessionDAO = {
    async findOne(query) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .select('*')
            .match(query)
            .single();

        if (error && error.code !== 'PGRST116') return null;
        return data ? { ...data, _id: data.id } : null;
    },

    async create(sessionData) {
        const { data, error } = await supabase
            .from('chat_sessions')
            .insert({
                session_id: sessionData.sessionId,
                messages: sessionData.messages || [],
                interaction_mode: sessionData.interactionMode || 'hybrid',
                student_context: sessionData.studentContext || {}
            })
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { ...data, _id: data.id };
    },

    async findByIdAndUpdate(id, updateData) {
        const snakeCaseData = {};
        for (const [key, value] of Object.entries(updateData)) {
            const snakeKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
            snakeCaseData[snakeKey] = value;
        }

        const { data, error } = await supabase
            .from('chat_sessions')
            .update(snakeCaseData)
            .eq('id', id)
            .select()
            .single();

        if (error) throw new Error(error.message);
        return { ...data, _id: data.id };
    },

    async findOneAndUpdate(query, updateData, options = {}) {
        // First find the document
        let existing = await this.findOne(query);

        if (!existing && options.upsert) {
            // Create new if upsert
            return this.create({ ...query, ...updateData });
        }

        if (existing) {
            return this.findByIdAndUpdate(existing.id, updateData);
        }

        return null;
    }
};

export default {
    UserDAO,
    TaskDAO,
    ScheduleDAO,
    ReadingDAO,
    ChatSessionDAO
};
