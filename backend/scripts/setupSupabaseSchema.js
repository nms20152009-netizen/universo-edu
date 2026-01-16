/**
 * Supabase Schema Setup Script
 * Run this script to create the database schema in Supabase
 * 
 * Usage: node scripts/setupSupabaseSchema.js
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_KEY in environment variables');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const schema = `
-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tasks table
CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    subject TEXT NOT NULL,
    topic TEXT,
    learning_objective TEXT,
    instructions JSONB DEFAULT '[]',
    materials JSONB DEFAULT '[]',
    multimedia JSONB DEFAULT '[]',
    duration INTEGER,
    is_collaborative BOOLEAN DEFAULT FALSE,
    week_number INTEGER,
    is_published BOOLEAN DEFAULT FALSE,
    publish_date TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    type TEXT DEFAULT 'task',
    content TEXT,
    status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Schedules table
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    cron_expression TEXT NOT NULL,
    task_type TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_run TIMESTAMPTZ,
    next_run TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Readings table
CREATE TABLE IF NOT EXISTS readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    theme TEXT,
    reflection_questions JSONB DEFAULT '[]',
    is_published BOOLEAN DEFAULT FALSE,
    publish_date TIMESTAMPTZ,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Chat sessions table
CREATE TABLE IF NOT EXISTS chat_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT UNIQUE NOT NULL,
    messages JSONB DEFAULT '[]',
    interaction_mode TEXT DEFAULT 'hybrid',
    student_context JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
`;

async function setupSchema() {
    console.log('🔄 Setting up Supabase schema...');
    console.log(`📡 Connecting to: ${supabaseUrl}`);

    try {
        // Test connection first
        const { data: testData, error: testError } = await supabase
            .from('users')
            .select('count', { count: 'exact', head: true });

        if (testError && testError.code === 'PGRST116') {
            console.log('📋 Tables do not exist yet. Schema needs to be created via Supabase Dashboard SQL Editor.');
            console.log('\n📝 Please run this SQL in the Supabase SQL Editor:');
            console.log('https://supabase.com/dashboard/project/nfebzcrzhanokyzcjktx/sql/new');
            console.log('\n' + '='.repeat(60));
            console.log(schema);
            console.log('='.repeat(60) + '\n');
        } else if (testError) {
            console.error('❌ Connection error:', testError.message);
        } else {
            console.log('✅ Tables already exist! Connection successful.');
        }
    } catch (error) {
        console.error('❌ Setup error:', error.message);
    }
}

setupSchema();
