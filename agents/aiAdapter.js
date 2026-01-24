/**
 * AI Adapter - Flexible AI provider interface for Serenity
 * Supports OpenAI, Gemini, and extensible for other providers
 */

import OpenAI from 'openai';

// AI Provider configuration
const AI_PROVIDERS = {
    OPENAI: 'openai',
    GEMINI: 'gemini',
    MOCK: 'mock' // For testing without API
};

/**
 * Create AI client based on environment configuration
 */
function createAIClient() {
    const provider = process.env.AI_PROVIDER || AI_PROVIDERS.OPENAI;

    switch (provider) {
        case AI_PROVIDERS.OPENAI:
            if (!process.env.OPENAI_API_KEY) {
                console.warn('⚠️ OPENAI_API_KEY not set. Using mock responses.');
                return null;
            }
            return new OpenAI({
                apiKey: process.env.OPENAI_API_KEY
            });

        case AI_PROVIDERS.GEMINI:
            // Gemini implementation can be added here
            console.warn('Gemini provider not yet implemented. Using mock.');
            return null;

        case AI_PROVIDERS.MOCK:
            return null;

        default:
            console.warn(`Unknown AI provider: ${provider}. Using mock.`);
            return null;
    }
}

const aiClient = createAIClient();

/**
 * Generate AI response with context
 * @param {Object} options - Generation options
 * @param {string} options.systemPrompt - System instructions
 * @param {Array} options.messages - Conversation history
 * @param {number} options.maxTokens - Max response tokens
 * @param {number} options.temperature - Response creativity (0-1)
 * @returns {Promise<string>} AI response text
 */
export async function generateResponse({
    systemPrompt,
    messages,
    maxTokens = 500,
    temperature = 0.7
}) {
    if (!aiClient) {
        return generateMockResponse(messages);
    }

    try {
        const completion = await aiClient.chat.completions.create({
            model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                ...messages
            ],
            max_tokens: maxTokens,
            temperature
        });

        return completion.choices[0].message.content;
    } catch (error) {
        console.error('AI generation error:', error.message);
        return generateMockResponse(messages);
    }
}

/**
 * Generate mock response for testing/fallback
 */
function generateMockResponse(messages) {
    const lastMessage = messages[messages.length - 1]?.content || '';

    const empathyResponses = [
        "I hear you, and I want you to know that your feelings are valid. Let's explore this together.",
        "Thank you for sharing that with me. It takes courage to open up. How are you feeling right now?",
        "I'm here for you. Would you like to talk more about what's on your mind?",
        "That sounds challenging. Remember, it's okay to take things one step at a time.",
        "I appreciate you trusting me with this. What would feel most helpful for you right now?"
    ];

    // Simple keyword-based response selection
    if (lastMessage.toLowerCase().includes('stress') || lastMessage.toLowerCase().includes('anxious')) {
        return "I can sense you're feeling stressed. Would you like to try a quick breathing exercise together? Taking a moment to breathe can help calm your nervous system.";
    }

    if (lastMessage.toLowerCase().includes('sad') || lastMessage.toLowerCase().includes('depress')) {
        return "I'm sorry you're feeling this way. Your emotions matter, and it's okay to feel sad sometimes. Would you like to talk about what's weighing on you, or would you prefer some gentle activities that might help lift your mood?";
    }

    if (lastMessage.toLowerCase().includes('sleep') || lastMessage.toLowerCase().includes('tired')) {
        return "Sleep is so important for our mental wellbeing. I've noticed you've been tracking your sleep. Would you like me to share some insights about your sleep patterns and maybe suggest some ways to improve your rest?";
    }

    if (lastMessage.toLowerCase().includes('hello') || lastMessage.toLowerCase().includes('hi')) {
        return "Hello! 👋 I'm Serenity, your AI companion for mental wellness. How are you feeling today? I'm here to listen and support you.";
    }

    return empathyResponses[Math.floor(Math.random() * empathyResponses.length)];
}

/**
 * Analyze text sentiment and emotions
 * @param {string} text - Text to analyze
 * @returns {Promise<Object>} Sentiment analysis result
 */
export async function analyzeTextSentiment(text) {
    if (!aiClient) {
        // Use local sentiment analysis as fallback
        return { sentiment: 'neutral', score: 0, emotions: ['neutral'] };
    }

    try {
        const completion = await aiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: 'Analyze the sentiment and emotions in the text. Return JSON: {"sentiment": "positive/negative/neutral", "score": -1 to 1, "emotions": ["emotion1", "emotion2"]}'
                },
                { role: 'user', content: text }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 100
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Sentiment analysis error:', error.message);
        return { sentiment: 'neutral', score: 0, emotions: ['neutral'] };
    }
}

/**
 * Generate personalized insights from user data
 * @param {Object} userData - Aggregated user data
 * @returns {Promise<Object>} Generated insights
 */
export async function generateInsights(userData) {
    const systemPrompt = `You are Serenity, an AI mental health companion. Based on the user's data, generate personalized insights. Be empathetic, supportive, and constructive. Return JSON:
{
  "overallMood": "description",
  "sleepQuality": "description", 
  "areasOfStrength": ["strength1", "strength2"],
  "areasForGrowth": ["area1", "area2"],
  "recommendations": ["rec1", "rec2", "rec3"],
  "encouragement": "personalized message"
}`;

    if (!aiClient) {
        return {
            overallMood: 'Based on your recent activity, you seem to be doing okay. Keep up the self-care!',
            sleepQuality: 'Your sleep patterns are within a healthy range.',
            areasOfStrength: ['Regular journaling', 'Consistent sleep schedule'],
            areasForGrowth: ['Stress management', 'Mindfulness practice'],
            recommendations: [
                'Try a 5-minute breathing exercise when feeling overwhelmed',
                'Consider journaling before bed to clear your mind',
                'Take short walks to boost your mood naturally'
            ],
            encouragement: 'Remember, every small step counts. You\'re doing great by taking care of your mental health!'
        };
    }

    try {
        const completion = await aiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: JSON.stringify(userData) }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 500
        });

        return JSON.parse(completion.choices[0].message.content);
    } catch (error) {
        console.error('Insights generation error:', error.message);
        return {
            overallMood: 'Unable to generate mood analysis at this time.',
            recommendations: ['Please try again later.'],
            encouragement: 'Remember, you\'re worthy of care and support!'
        };
    }
}

export { AI_PROVIDERS };
export default { generateResponse, analyzeTextSentiment, generateInsights, AI_PROVIDERS };
