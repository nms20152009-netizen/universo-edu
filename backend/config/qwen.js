import dotenv from 'dotenv';

// Ensure environment variables are loaded before reading keys
dotenv.config();

/**
 * QWEN 3.5 MAX API Configuration
 * Free tier integration for UNIVERSO EDU
 */
export const qwenConfig = {
    baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
    model: 'qwen-max',

    // API keys for different services
    keys: {
        chatbot: process.env.QWEN_CHATBOT_API_KEY,
        taskGenerator: process.env.QWEN_TASK_GENERATOR_API_KEY,
        fallback: process.env.QWEN_FALLBACK_API_KEY
    },

    // Request configuration
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,

    // Model parameters for educational content
    defaultParams: {
        temperature: 0.7,
        max_tokens: 1024,
        top_p: 0.9
    }
};

export default qwenConfig;

