/**
 * Environment Configuration
 * Centralized environment variable management
 */

import { config } from "dotenv";

// Load environment-specific config
config({ path: `.env.${process.env.NODE_ENV || 'development'}.local` });

// Core Configuration
export const {
    PORT,
    NODE_ENV,
    DB_URI,
    JWT_SECRET,
    JWT_EXPIRES_IN,

    // Email Configuration
    EMAIL_USER,
    EMAIL_PASS,
    EMAIL_HOST,
    EMAIL_PORT,
    EMAIL_SECURE,
    EMAIL_FROM,

    // AI Configuration
    OPENAI_API_KEY,
    OPENAI_MODEL,
    AI_PROVIDER,

    // Google Cloud Configuration (for Voice)
    GOOGLE_CLOUD_PROJECT,
    GOOGLE_APPLICATION_CREDENTIALS,

    // Socket.io Configuration
    CORS_ORIGINS,

    // Security
    ARCJET_KEY
} = process.env;

// AI Configuration defaults
export const AI_CONFIG = {
    provider: AI_PROVIDER || 'openai',
    model: OPENAI_MODEL || 'gpt-4o-mini',
    maxTokens: 500,
    temperature: 0.7
};

// Voice Configuration
export const VOICE_CONFIG = {
    enabled: !!(GOOGLE_APPLICATION_CREDENTIALS || GOOGLE_CLOUD_PROJECT),
    languageCode: 'en-US',
    voiceName: 'en-US-Neural2-F' // Female neural voice for Serenity
};

// Validation
export function validateEnvironment() {
    const required = ['DB_URI', 'JWT_SECRET'];
    const missing = required.filter(key => !process.env[key]);

    if (missing.length > 0) {
        console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
        process.exit(1);
    }

    // Warnings for optional but recommended vars
    const warnings = [];
    if (!OPENAI_API_KEY) {
        warnings.push('OPENAI_API_KEY not set - Serenity AI will use mock responses');
    }
    if (!GOOGLE_APPLICATION_CREDENTIALS && !GOOGLE_CLOUD_PROJECT) {
        warnings.push('Google Cloud credentials not set - Voice features will use mock responses');
    }
    if (!ARCJET_KEY) {
        warnings.push('ARCJET_KEY not set - Security protection disabled');
    }

    warnings.forEach(w => console.warn(`⚠️ ${w}`));

    return true;
}
