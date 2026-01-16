import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️ Supabase credentials not found. Database operations will fail.');
}

export const supabase = createClient(supabaseUrl || '', supabaseKey || '', {
    auth: {
        persistSession: false,
        autoRefreshToken: false
    }
});

/**
 * Test Supabase connection
 */
export const testSupabaseConnection = async () => {
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });
        if (error && error.code !== 'PGRST116') { // PGRST116 = table doesn't exist, which is fine on first run
            throw error;
        }
        console.log('✅ Supabase connected successfully');
        return true;
    } catch (error) {
        console.error('❌ Supabase connection error:', error.message);
        return false;
    }
};

export default supabase;
