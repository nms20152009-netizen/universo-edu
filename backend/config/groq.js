import dotenv from 'dotenv';

dotenv.config();

/**
 * Groq API Configuration
 * Free tier with generous limits - perfect for educational chatbots
 * Uses Llama 3.3 70B or Mixtral for excellent Spanish support
 */
export const groqConfig = {
    baseURL: 'https://api.groq.com/openai/v1',

    // Primary model - Llama 3.3 70B has excellent Spanish and instruction following
    model: 'llama-3.3-70b-versatile',

    // Fallback model - faster, still good
    fallbackModel: 'llama-3.1-8b-instant',

    // API key from environment
    apiKey: process.env.GROQ_API_KEY,

    // Request configuration
    timeout: 30000,
    maxRetries: 3,
    retryDelay: 1000,

    // Model parameters optimized for educational content
    defaultParams: {
        temperature: 0.7,
        max_tokens: 500,
        top_p: 0.9
    }
};

export default groqConfig;
