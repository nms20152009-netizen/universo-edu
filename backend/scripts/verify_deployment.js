import axios from 'axios';

const baseUrl = process.argv[2];

if (!baseUrl) {
    console.error('❌ Usage: node verify_deployment.js <YOUR_RENDER_URL>');
    console.log('Example: node verify_deployment.js https://universo-edu-backend.onrender.com');
    process.exit(1);
}

const verify = async () => {
    console.log(`🔍 Verifying deployment at: ${baseUrl}`);

    // 1. Health Check
    try {
        console.log('Testing /health...');
        const health = await axios.get(`${baseUrl}/health`);
        if (health.data.status === 'ok') {
            console.log('✅ Health check passed:', health.data);
        } else {
            console.error('❌ Health check returned unexpected status:', health.data);
        }
    } catch (e) {
        console.error('❌ Health check failed:', e.message);
        if (e.response) console.error('Status:', e.response.status);
    }

    // 2. Auth Check (Public Key or similar?)
    // Since we don't have a token, we expect 401 or 403 on protected routes, confirming auth is active.
    try {
        console.log('Testing protected route /api/admin/tasks (expecting 401/403)...');
        await axios.get(`${baseUrl}/api/admin/tasks`);
        console.warn('⚠️ Unexpected success on protected route (Auth might be disabled?)');
    } catch (e) {
        if (e.response && (e.response.status === 401 || e.response.status === 403)) {
            console.log('✅ Auth middleware active (Got expected 401/403).');
        } else {
            console.error('❌ Unexpected error on protected route:', e.message);
        }
    }

    // 3. Public Route (if any)
    // /api/readings/today usually public?
    // Let's check readings routes in code... readingRoutes usually has some public access?
    // Based on readingService, getting latest reading might be protected or public.
    // Let's assume /api/readings/latest is a good candidate if it exists.
    // Inspecting readingRoutes.js would confirm, but let's try a safe bet or skip.

    console.log('\nDeployment verification finished.');
};

verify();
