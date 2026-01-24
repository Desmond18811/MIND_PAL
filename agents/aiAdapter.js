/**
 * AI Adapter - Multi-Provider AI Interface for Serenity
 * Supports automatic failover: OpenAI → Gemini → Hugging Face
 * Includes context-aware responses and learning capabilities
 */

import OpenAI from 'openai';

// AI Provider configuration
const AI_PROVIDERS = {
    OPENAI: 'openai',
    GEMINI: 'gemini',
    HUGGINGFACE: 'huggingface',
    MOCK: 'mock'
};

// Provider priority for automatic failover
const PROVIDER_PRIORITY = [
    AI_PROVIDERS.OPENAI,
    AI_PROVIDERS.GEMINI,
    AI_PROVIDERS.HUGGINGFACE
];

// Initialize clients
let openaiClient = null;
let geminiClient = null;
let hfClient = null;
let currentProvider = AI_PROVIDERS.MOCK;

/**
 * Initialize all AI providers
 */
async function initializeProviders() {
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
        try {
            openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
            currentProvider = AI_PROVIDERS.OPENAI;
            console.log('✅ OpenAI provider initialized');
        } catch (error) {
            console.warn('⚠️ OpenAI initialization failed:', error.message);
        }
    }

    // Gemini
    if (process.env.GEMINI_API_KEY) {
        try {
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
            if (!openaiClient) currentProvider = AI_PROVIDERS.GEMINI;
            console.log('✅ Gemini provider initialized');
        } catch (error) {
            console.warn('⚠️ Gemini initialization failed:', error.message);
        }
    }

    // Hugging Face
    if (process.env.HUGGINGFACE_API_KEY) {
        try {
            const { HfInference } = await import('@huggingface/inference');
            hfClient = new HfInference(process.env.HUGGINGFACE_API_KEY);
            if (!openaiClient && !geminiClient) currentProvider = AI_PROVIDERS.HUGGINGFACE;
            console.log('✅ Hugging Face provider initialized');
        } catch (error) {
            console.warn('⚠️ Hugging Face initialization failed:', error.message);
        }
    }

    if (!openaiClient && !geminiClient && !hfClient) {
        console.warn('⚠️ No AI providers available. Using mock responses.');
        currentProvider = AI_PROVIDERS.MOCK;
    }

    return currentProvider;
}

// Initialize on module load
initializeProviders();

/**
 * Generate response with automatic failover between providers
 */
export async function generateResponse({
    systemPrompt,
    messages,
    userContext = null,
    maxTokens = 500,
    temperature = 0.7
}) {
    // Build enhanced prompt with user context for personalization
    const enhancedSystemPrompt = buildEnhancedPrompt(systemPrompt, userContext);

    // Try each provider in priority order
    for (const provider of PROVIDER_PRIORITY) {
        try {
            const result = await tryProvider(provider, enhancedSystemPrompt, messages, maxTokens, temperature);
            if (result) {
                return result;
            }
        } catch (error) {
            console.warn(`Provider ${provider} failed, trying next...`, error.message);
        }
    }

    // All providers failed, use mock
    return generateContextualMockResponse(messages, userContext);
}

/**
 * Try a specific AI provider
 */
async function tryProvider(provider, systemPrompt, messages, maxTokens, temperature) {
    switch (provider) {
        case AI_PROVIDERS.OPENAI:
            if (!openaiClient) return null;
            return await generateOpenAIResponse(systemPrompt, messages, maxTokens, temperature);

        case AI_PROVIDERS.GEMINI:
            if (!geminiClient) return null;
            return await generateGeminiResponse(systemPrompt, messages, maxTokens, temperature);

        case AI_PROVIDERS.HUGGINGFACE:
            if (!hfClient) return null;
            return await generateHuggingFaceResponse(systemPrompt, messages, maxTokens, temperature);

        default:
            return null;
    }
}

/**
 * OpenAI response generation
 */
async function generateOpenAIResponse(systemPrompt, messages, maxTokens, temperature) {
    const completion = await openaiClient.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages: [
            { role: 'system', content: systemPrompt },
            ...messages
        ],
        max_tokens: maxTokens,
        temperature
    });

    return completion.choices[0].message.content;
}

/**
 * Gemini response generation
 */
async function generateGeminiResponse(systemPrompt, messages, maxTokens, temperature) {
    const model = geminiClient.getGenerativeModel({
        model: process.env.GEMINI_MODEL || 'gemini-1.5-flash'
    });

    // Convert messages to Gemini format
    const prompt = `${systemPrompt}\n\nConversation:\n${messages.map(m =>
        `${m.role === 'user' ? 'User' : 'Serenity'}: ${m.content}`
    ).join('\n')}\n\nSerenity:`;

    const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: {
            maxOutputTokens: maxTokens,
            temperature
        }
    });

    return result.response.text();
}

/**
 * Hugging Face response generation
 */
async function generateHuggingFaceResponse(systemPrompt, messages, maxTokens, temperature) {
    const model = process.env.HUGGINGFACE_MODEL || 'mistralai/Mistral-7B-Instruct-v0.2';

    // Format conversation for instruction-following model
    const prompt = `<s>[INST] ${systemPrompt}

Current conversation:
${messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

Respond as Serenity, the AI mental health companion: [/INST]`;

    const response = await hfClient.textGeneration({
        model,
        inputs: prompt,
        parameters: {
            max_new_tokens: maxTokens,
            temperature,
            return_full_text: false
        }
    });

    return response.generated_text.trim();
}

/**
 * Build enhanced prompt with user context for personalization
 */
function buildEnhancedPrompt(basePrompt, userContext) {
    if (!userContext) return basePrompt;

    let contextSection = '\n\n## User Context (for personalization):\n';

    if (userContext.name) {
        contextSection += `- User's name: ${userContext.name}\n`;
    }

    if (userContext.recentMoods && userContext.recentMoods.length > 0) {
        const avgMood = (userContext.recentMoods.reduce((a, b) => a + b, 0) / userContext.recentMoods.length).toFixed(1);
        const trend = determineTrend(userContext.recentMoods);
        contextSection += `- Recent mood: ${avgMood}/10 (${trend} trend)\n`;
    }

    if (userContext.lastSleep) {
        contextSection += `- Last night's sleep: ${userContext.lastSleep.duration} hours, quality: ${userContext.lastSleep.quality}/10\n`;
    }

    if (userContext.stressLevel) {
        contextSection += `- Current stress level: ${userContext.stressLevel}/5\n`;
    }

    if (userContext.recentJournalThemes && userContext.recentJournalThemes.length > 0) {
        contextSection += `- Recent journal themes: ${userContext.recentJournalThemes.join(', ')}\n`;
    }

    if (userContext.topConcerns && userContext.topConcerns.length > 0) {
        contextSection += `- Topics user has discussed: ${userContext.topConcerns.join(', ')}\n`;
    }

    if (userContext.lastActivity) {
        contextSection += `- Last activity: ${userContext.lastActivity}\n`;
    }

    if (userContext.learningInsights && userContext.learningInsights.length > 0) {
        contextSection += `- Key patterns noticed: ${userContext.learningInsights.join('; ')}\n`;
    }

    contextSection += '\nUse this context to personalize your responses but don\'t explicitly mention that you\'re reading data unless asked.\n';

    return basePrompt + contextSection;
}

/**
 * Determine trend from values array
 */
function determineTrend(values) {
    if (!values || values.length < 2) return 'stable';
    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));
    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    if (avgSecond - avgFirst > 0.5) return 'improving';
    if (avgFirst - avgSecond > 0.5) return 'declining';
    return 'stable';
}

/**
 * Generate contextual mock response using user data
 */
function generateContextualMockResponse(messages, userContext) {
    const lastMessage = messages[messages.length - 1]?.content?.toLowerCase() || '';

    // Context-aware responses based on user data
    if (userContext) {
        // Low mood detection
        if (userContext.recentMoods && userContext.recentMoods.length > 0) {
            const avgMood = userContext.recentMoods.reduce((a, b) => a + b, 0) / userContext.recentMoods.length;
            if (avgMood < 4) {
                return "I've noticed you've been having some tough days recently. Remember, it's okay to not be okay sometimes. Would you like to talk about what's been weighing on you, or would you prefer we try a calming activity together?";
            }
            if (avgMood > 7) {
                return "You've been in great spirits lately! That's wonderful to see. What's been contributing to your positive mood? I'd love to hear about it.";
            }
        }

        // Sleep-related issues
        if (userContext.lastSleep && userContext.lastSleep.duration < 6) {
            if (lastMessage.includes('tired') || lastMessage.includes('sleep') || lastMessage.includes('exhausted')) {
                return `I see you only got about ${userContext.lastSleep.duration} hours of sleep last night. That can really affect how we feel. Would you like some tips for better sleep tonight, or shall we try a relaxing breathing exercise?`;
            }
        }

        // Stress level response
        if (userContext.stressLevel && userContext.stressLevel >= 4) {
            if (lastMessage.includes('stress') || lastMessage.includes('overwhelm') || lastMessage.includes('anxious')) {
                return "I understand you're feeling overwhelmed. When stress levels are high, even small things can feel like too much. Let's take a moment together - would you like to try a quick grounding exercise? It only takes 2 minutes.";
            }
        }

        // Name personalization
        if (userContext.name) {
            if (lastMessage.includes('hello') || lastMessage.includes('hi') || lastMessage.includes('hey')) {
                return `Hi ${userContext.name}! 😊 I'm so glad you're here. How has your day been going? Is there anything specific on your mind that you'd like to talk about?`;
            }
        }
    }

    // Keyword-based responses
    const keywordResponses = {
        'stress|anxious|anxiety|worried|panic':
            "I can hear that you're feeling stressed right now. Your feelings are completely valid. Would you like to try a quick breathing exercise together? Deep breathing can help activate your body's relaxation response.",

        'sad|depress|down|unhappy|crying':
            "I'm sorry you're going through this. It takes strength to acknowledge how you're feeling. Would you like to talk about what's on your mind, or would you prefer some gentle activities that might help lift your spirits?",

        'sleep|tired|exhausted|insomnia|wake':
            "Sleep is so important for our mental wellbeing. Poor sleep can make everything feel harder. Would you like me to share some sleep hygiene tips, or suggest a relaxing activity before bed tonight?",

        'angry|frustrated|upset|annoyed':
            "It sounds like you're dealing with some frustrating feelings right now. That's completely understandable. Sometimes expressing our frustration can help - would you like to tell me more about what's bothering you?",

        'lonely|alone|isolated|nobody':
            "Feeling lonely can be really difficult. I want you to know that reaching out, like you're doing now, is a brave step. I'm here to listen whenever you need. Would you like to talk about it?",

        'happy|great|good|excited|wonderful':
            "That's wonderful to hear! 🌟 Positive moments are worth celebrating. What's been making you feel so good? I'd love to hear more about it.",

        'help|advice|suggestion|what should':
            "I'm here to support you in whatever way feels right. Would you like suggestions for activities, someone to talk to, or just a space to express how you're feeling?"
    };

    for (const [pattern, response] of Object.entries(keywordResponses)) {
        if (new RegExp(pattern, 'i').test(lastMessage)) {
            return response;
        }
    }

    // Default empathetic response
    const defaults = [
        "I hear you, and I want you to know that your feelings matter. What would feel most helpful for you right now?",
        "Thank you for sharing that with me. It takes courage to open up. How are you feeling in this moment?",
        "I'm here for you, always ready to listen. Would you like to explore what's on your mind together?",
        "That's a thoughtful reflection. What do you think might help you feel more at peace today?",
        "I appreciate you trusting me with this. Let's take things one step at a time - what feels most pressing right now?"
    ];

    return defaults[Math.floor(Math.random() * defaults.length)];
}

/**
 * Analyze text sentiment with failover
 */
export async function analyzeTextSentiment(text) {
    // Try OpenAI first
    if (openaiClient) {
        try {
            const completion = await openaiClient.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [
                    {
                        role: 'system',
                        content: 'Analyze the sentiment and emotions. Return only valid JSON: {"sentiment": "positive/negative/neutral", "score": -1 to 1, "emotions": ["emotion1", "emotion2"], "intensity": "low/medium/high"}'
                    },
                    { role: 'user', content: text }
                ],
                response_format: { type: 'json_object' },
                max_tokens: 100
            });

            return JSON.parse(completion.choices[0].message.content);
        } catch (error) {
            console.warn('OpenAI sentiment analysis failed:', error.message);
        }
    }

    // Fallback: Simple keyword-based sentiment
    return analyzeLocalSentiment(text);
}

/**
 * Local sentiment analysis fallback
 */
function analyzeLocalSentiment(text) {
    const lowerText = text.toLowerCase();

    const positiveWords = ['happy', 'great', 'good', 'wonderful', 'amazing', 'excited', 'love', 'grateful', 'peaceful', 'calm', 'better', 'joy', 'hope', 'smile'];
    const negativeWords = ['sad', 'angry', 'frustrated', 'stressed', 'anxious', 'worried', 'tired', 'overwhelmed', 'depressed', 'lonely', 'scared', 'hurt', 'pain', 'hate'];

    let positiveCount = 0;
    let negativeCount = 0;
    const detectedEmotions = [];

    positiveWords.forEach(word => {
        if (lowerText.includes(word)) {
            positiveCount++;
            detectedEmotions.push(word);
        }
    });

    negativeWords.forEach(word => {
        if (lowerText.includes(word)) {
            negativeCount++;
            detectedEmotions.push(word);
        }
    });

    const total = positiveCount + negativeCount;
    let score = 0;
    let sentiment = 'neutral';

    if (total > 0) {
        score = (positiveCount - negativeCount) / total;
        sentiment = score > 0.2 ? 'positive' : score < -0.2 ? 'negative' : 'neutral';
    }

    return {
        sentiment,
        score: parseFloat(score.toFixed(2)),
        emotions: detectedEmotions.slice(0, 3),
        intensity: total > 3 ? 'high' : total > 1 ? 'medium' : 'low'
    };
}

/**
 * Generate personalized insights with failover
 */
export async function generateInsights(userData) {
    const systemPrompt = `You are Serenity, an AI mental health companion. Analyze the user's data patterns and provide personalized, empathetic insights. Be supportive and constructive. Return JSON:
{
  "overallMood": "descriptive assessment",
  "sleepQuality": "assessment with specific observations",
  "areasOfStrength": ["strength1", "strength2"],
  "areasForGrowth": ["specific actionable area1", "area2"],
  "recommendations": ["specific actionable recommendation1", "rec2", "rec3"],
  "encouragement": "personalized motivational message",
  "patterns": ["observed pattern1", "pattern2"]
}`;

    // Try AI providers
    for (const provider of PROVIDER_PRIORITY) {
        try {
            const result = await tryInsightsGeneration(provider, systemPrompt, userData);
            if (result) return result;
        } catch (error) {
            console.warn(`Insights generation with ${provider} failed:`, error.message);
        }
    }

    // Fallback: Generate insights from data locally
    return generateLocalInsights(userData);
}

/**
 * Try insights generation with specific provider
 */
async function tryInsightsGeneration(provider, systemPrompt, userData) {
    if (provider === AI_PROVIDERS.OPENAI && openaiClient) {
        const completion = await openaiClient.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: systemPrompt },
                { role: 'user', content: `User data: ${JSON.stringify(userData)}` }
            ],
            response_format: { type: 'json_object' },
            max_tokens: 600
        });
        return JSON.parse(completion.choices[0].message.content);
    }

    if (provider === AI_PROVIDERS.GEMINI && geminiClient) {
        const model = geminiClient.getGenerativeModel({ model: 'gemini-1.5-flash' });
        const result = await model.generateContent({
            contents: [{
                role: 'user',
                parts: [{ text: `${systemPrompt}\n\nUser data: ${JSON.stringify(userData)}\n\nRespond with valid JSON only.` }]
            }]
        });
        const text = result.response.text();
        return JSON.parse(text.replace(/```json\n?|\n?```/g, ''));
    }

    return null;
}

/**
 * Generate insights locally when AI is unavailable
 */
function generateLocalInsights(userData) {
    const insights = {
        overallMood: 'Based on your recent activity, you seem to be doing okay.',
        sleepQuality: 'Your sleep patterns appear to be within a healthy range.',
        areasOfStrength: [],
        areasForGrowth: [],
        recommendations: [],
        encouragement: 'Every step you take towards self-care matters. Keep going!',
        patterns: []
    };

    // Analyze mood data
    if (userData.moods && userData.moods.length > 0) {
        const avgMood = userData.moods.reduce((sum, m) => sum + (m.value || m), 0) / userData.moods.length;
        if (avgMood >= 7) {
            insights.overallMood = 'You\'ve been feeling quite positive lately - that\'s wonderful!';
            insights.areasOfStrength.push('Maintaining positive outlook');
        } else if (avgMood <= 4) {
            insights.overallMood = 'You\'ve been having some challenging days recently. Remember, it\'s okay to have tough times.';
            insights.areasForGrowth.push('Building emotional resilience');
            insights.recommendations.push('Try starting each day with a 5-minute gratitude practice');
        } else {
            insights.overallMood = 'Your mood has been relatively balanced with some ups and downs - that\'s perfectly normal.';
        }
    }

    // Analyze sleep data
    if (userData.sleep && userData.sleep.length > 0) {
        const avgSleep = userData.sleep.reduce((sum, s) => sum + (s.duration || 0), 0) / userData.sleep.length;
        if (avgSleep < 6) {
            insights.sleepQuality = 'You seem to be getting less sleep than recommended. This could be affecting your mood.';
            insights.recommendations.push('Try establishing a consistent bedtime routine');
            insights.areasForGrowth.push('Improving sleep habits');
        } else if (avgSleep >= 7) {
            insights.sleepQuality = 'Your sleep duration looks healthy!';
            insights.areasOfStrength.push('Good sleep habits');
        }
    }

    // Journal insights
    if (userData.journals && userData.journals.length > 0) {
        insights.areasOfStrength.push('Regular self-reflection through journaling');
        if (userData.journals.some(j => j.sentimentScore < 0)) {
            insights.patterns.push('Some journal entries show signs of stress');
            insights.recommendations.push('Consider trying guided breathing exercises when feeling overwhelmed');
        }
    }

    // Fill in defaults if empty
    if (insights.areasOfStrength.length === 0) {
        insights.areasOfStrength.push('Taking steps to understand yourself better');
    }
    if (insights.recommendations.length === 0) {
        insights.recommendations.push('Try a 5-minute breathing exercise daily', 'Consider keeping a gratitude journal', 'Take short walks in nature when possible');
    }

    return insights;
}

/**
 * Generate voice response text optimized for TTS
 * Makes the response more natural for speech
 */
export function prepareForVoice(text) {
    let voiceText = text
        // Remove emojis
        .replace(/[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '')
        // Replace markdown-style formatting
        .replace(/\*\*([^*]+)\*\*/g, '$1')
        .replace(/\*([^*]+)\*/g, '$1')
        .replace(/__([^_]+)__/g, '$1')
        .replace(/_([^_]+)_/g, '$1')
        // Add pauses after sentences
        .replace(/\. /g, '. ... ')
        .replace(/\? /g, '? ... ')
        .replace(/! /g, '! ... ')
        // Improve number reading
        .replace(/(\d+)/g, (match) => {
            const num = parseInt(match);
            if (num >= 1 && num <= 10) {
                const words = ['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten'];
                return words[num - 1];
            }
            return match;
        })
        // Clean up multiple spaces
        .replace(/\s+/g, ' ')
        .trim();

    return voiceText;
}

/**
 * Get current active provider
 */
export function getCurrentProvider() {
    if (openaiClient) return AI_PROVIDERS.OPENAI;
    if (geminiClient) return AI_PROVIDERS.GEMINI;
    if (hfClient) return AI_PROVIDERS.HUGGINGFACE;
    return AI_PROVIDERS.MOCK;
}

/**
 * Get provider status
 */
export function getProviderStatus() {
    return {
        openai: { available: !!openaiClient, configured: !!process.env.OPENAI_API_KEY },
        gemini: { available: !!geminiClient, configured: !!process.env.GEMINI_API_KEY },
        huggingface: { available: !!hfClient, configured: !!process.env.HUGGINGFACE_API_KEY },
        current: getCurrentProvider()
    };
}

export { AI_PROVIDERS };
export default {
    generateResponse,
    analyzeTextSentiment,
    generateInsights,
    prepareForVoice,
    getCurrentProvider,
    getProviderStatus,
    AI_PROVIDERS
};
