/**
 * Voice Service - Enhanced Speech-to-Text and Text-to-Speech for Serenity
 * Includes voice personality, emotion-aware synthesis, and multiple provider fallback
 */

import { analyzeTextSentiment, prepareForVoice } from '../agents/aiAdapter.js';

// Voice personality configuration for Serenity
const SERENITY_VOICE_CONFIG = {
    // Google Cloud voices
    google: {
        primary: 'en-US-Neural2-F',     // Warm female voice
        alternative: 'en-US-Studio-O',   // Studio quality female
        fallback: 'en-US-Wavenet-F'      // Wavenet female
    },
    // Speaking rate adjustments based on emotion
    speedByEmotion: {
        calm: 0.95,
        encouraging: 1.0,
        empathetic: 0.9,
        energetic: 1.05,
        default: 0.95
    },
    // Pitch adjustments
    pitchByEmotion: {
        calm: -1,
        encouraging: 0,
        empathetic: -2,
        energetic: 1,
        default: -1
    }
};

// Check for Google Cloud credentials
const hasGoogleCredentials = process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_PROJECT;

let speechClient = null;
let ttsClient = null;

// Initialize Google Cloud clients if credentials available
async function initGoogleClients() {
    if (hasGoogleCredentials) {
        try {
            const { SpeechClient } = await import('@google-cloud/speech');
            const { TextToSpeechClient } = await import('@google-cloud/text-to-speech');
            speechClient = new SpeechClient();
            ttsClient = new TextToSpeechClient();
            console.log('🎤 Google Cloud Speech services initialized');
            return true;
        } catch (error) {
            console.warn('⚠️ Failed to initialize Google Cloud Speech:', error.message);
            return false;
        }
    } else {
        console.warn('⚠️ Google Cloud credentials not found. Voice services will use mock responses.');
        return false;
    }
}

// Initialize on module load
initGoogleClients();

/**
 * Transcribe audio buffer to text
 * @param {Buffer} audioBuffer - Audio data buffer
 * @param {Object} options - Transcription options
 * @returns {Object} Transcription result
 */
async function transcribeAudio(audioBuffer, options = {}) {
    const {
        encoding = 'audio/webm',
        languageCode = 'en-US'
    } = options;

    // Use Google Cloud if available
    if (speechClient) {
        try {
            const audioBytes = audioBuffer.toString('base64');

            // Determine encoding type
            let encodingType = 'WEBM_OPUS';
            if (encoding.includes('wav')) encodingType = 'LINEAR16';
            else if (encoding.includes('mp3') || encoding.includes('mpeg')) encodingType = 'MP3';
            else if (encoding.includes('ogg')) encodingType = 'OGG_OPUS';
            else if (encoding.includes('m4a')) encodingType = 'MP3';

            const request = {
                audio: { content: audioBytes },
                config: {
                    encoding: encodingType,
                    sampleRateHertz: 48000,
                    languageCode,
                    enableAutomaticPunctuation: true,
                    model: 'latest_long',
                    useEnhanced: true
                }
            };

            const [response] = await speechClient.recognize(request);
            const transcription = response.results
                .map(result => result.alternatives[0].transcript)
                .join(' ');

            const confidence = response.results[0]?.alternatives[0]?.confidence || 0.9;

            return {
                success: true,
                text: transcription,
                confidence,
                duration: null
            };
        } catch (error) {
            console.error('Google STT error:', error.message);
            return getMockTranscription();
        }
    }

    // Mock transcription for testing
    return getMockTranscription();
}

/**
 * Mock transcription for testing without Google Cloud
 */
function getMockTranscription() {
    const mockResponses = [
        "I've been feeling a bit stressed lately with work and life.",
        "Today was actually a pretty good day, I went for a nice walk.",
        "I'm having trouble sleeping and it's really affecting my mood.",
        "I practiced the breathing exercises and they really helped me calm down.",
        "I want to talk about some anxiety I've been experiencing lately.",
        "I'm feeling grateful today for the small things in my life.",
        "Work has been overwhelming and I don't know how to cope."
    ];

    return {
        success: true,
        text: mockResponses[Math.floor(Math.random() * mockResponses.length)],
        confidence: 0.85,
        duration: 5,
        mock: true
    };
}

/**
 * Generate Serenity's voice response
 * This is the main function to make Serenity "speak"
 * @param {string} text - Text for Serenity to say
 * @param {Object} options - Voice options
 * @returns {Object} Audio response
 */
async function generateSerenityVoice(text, options = {}) {
    const {
        emotion = 'empathetic',
        urgency = 'normal'
    } = options;

    // Prepare text for natural speech
    const voiceText = prepareForVoice(text);

    // Determine voice parameters based on emotion
    const speakingRate = SERENITY_VOICE_CONFIG.speedByEmotion[emotion] ||
        SERENITY_VOICE_CONFIG.speedByEmotion.default;
    const pitch = SERENITY_VOICE_CONFIG.pitchByEmotion[emotion] ||
        SERENITY_VOICE_CONFIG.pitchByEmotion.default;

    // Generate speech
    const result = await synthesizeSpeech(voiceText, {
        voice: SERENITY_VOICE_CONFIG.google.primary,
        speakingRate,
        pitch
    });

    return {
        ...result,
        emotion,
        originalText: text,
        voiceText
    };
}

/**
 * Convert text to speech audio
 * @param {string} text - Text to synthesize
 * @param {Object} options - Synthesis options
 * @returns {Object} Audio content result
 */
async function synthesizeSpeech(text, options = {}) {
    const {
        voice = SERENITY_VOICE_CONFIG.google.primary,
        speakingRate = 0.95,
        pitch = -1
    } = options;

    // Use Google Cloud if available
    if (ttsClient) {
        try {
            // Use SSML for better emotional expression
            const ssmlText = buildSSML(text, speakingRate);

            const request = {
                input: { ssml: ssmlText },
                voice: {
                    languageCode: 'en-US',
                    name: voice
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate,
                    pitch,
                    volumeGainDb: 0
                }
            };

            const [response] = await ttsClient.synthesizeSpeech(request);

            return {
                success: true,
                audioContent: response.audioContent.toString('base64'),
                contentType: 'audio/mp3',
                duration: estimateDuration(text, speakingRate)
            };
        } catch (error) {
            console.error('Google TTS error:', error.message);

            // Try fallback voice
            try {
                const fallbackRequest = {
                    input: { text },
                    voice: {
                        languageCode: 'en-US',
                        name: SERENITY_VOICE_CONFIG.google.fallback
                    },
                    audioConfig: {
                        audioEncoding: 'MP3',
                        speakingRate
                    }
                };
                const [fallbackResponse] = await ttsClient.synthesizeSpeech(fallbackRequest);
                return {
                    success: true,
                    audioContent: fallbackResponse.audioContent.toString('base64'),
                    contentType: 'audio/mp3'
                };
            } catch (fallbackError) {
                console.error('Fallback TTS also failed:', fallbackError.message);
                return getMockSynthesis(text);
            }
        }
    }

    // Mock synthesis for testing
    return getMockSynthesis(text);
}

/**
 * Build SSML for more natural speech
 */
function buildSSML(text, rate) {
    // Add natural pauses and emphasis
    let ssml = text
        // Add pause after greeting
        .replace(/(Hi[,!]?|Hello[,!]?|Hey[,!]?)/gi, '$1<break time="300ms"/>')
        // Add pause before questions
        .replace(/(\?)/g, '<break time="200ms"/>$1')
        // Add gentle pause after sentences
        .replace(/(\. )/g, '.<break time="250ms"/> ')
        // Emphasize key emotional words gently
        .replace(/(wonderful|amazing|great|proud)/gi, '<emphasis level="moderate">$1</emphasis>')
        .replace(/(understand|hear you|here for you)/gi, '<emphasis level="moderate">$1</emphasis>');

    return `<speak>${ssml}</speak>`;
}

/**
 * Estimate audio duration based on text and rate
 */
function estimateDuration(text, rate = 1.0) {
    // Average speaking rate is about 150 words per minute
    const words = text.split(/\s+/).length;
    const minutes = words / (150 * rate);
    return Math.round(minutes * 60); // seconds
}

/**
 * Mock synthesis for testing without Google Cloud
 */
function getMockSynthesis(text = '') {
    return {
        success: true,
        audioContent: null,
        contentType: 'audio/mp3',
        mock: true,
        message: `Serenity would say: "${text.substring(0, 100)}..."`,
        estimatedDuration: estimateDuration(text)
    };
}

/**
 * Detect emotion in text to adjust voice parameters
 */
function detectEmotionForVoice(text) {
    const lowerText = text.toLowerCase();

    // Calming content
    if (lowerText.includes('breathe') || lowerText.includes('relax') || lowerText.includes('calm')) {
        return 'calm';
    }

    // Encouraging content
    if (lowerText.includes('great job') || lowerText.includes('proud') || lowerText.includes('wonderful')) {
        return 'encouraging';
    }

    // Empathetic content (default for mental health support)
    if (lowerText.includes('understand') || lowerText.includes('hear you') || lowerText.includes('sorry')) {
        return 'empathetic';
    }

    // Energetic content
    if (lowerText.includes('excited') || lowerText.includes('amazing') || lowerText.includes('celebrate')) {
        return 'energetic';
    }

    return 'empathetic'; // Default for Serenity
}

/**
 * Analyze voice content for emotional patterns
 * @param {Array} voiceMessages - Array of voice messages with transcriptions
 * @returns {Object} Voice analysis result
 */
async function analyzeVoiceContent(voiceMessages) {
    if (!voiceMessages || voiceMessages.length === 0) {
        return {
            success: false,
            message: 'No voice messages to analyze'
        };
    }

    // Combine transcriptions for analysis
    const combinedText = voiceMessages
        .map(m => m.content)
        .join(' ');

    // Get sentiment analysis
    const sentiment = await analyzeTextSentiment(combinedText);

    // Calculate average message length
    const avgLength = voiceMessages.reduce((sum, m) =>
        sum + (m.content?.length || 0), 0) / voiceMessages.length;

    // Determine emotional trends
    const emotionalTrend = sentiment.score > 0.2 ? 'positive' :
        sentiment.score < -0.2 ? 'concerning' : 'neutral';

    // Detect speaking patterns
    const speakingPatterns = analyzeSpeakingPatterns(voiceMessages);

    return {
        success: true,
        messageCount: voiceMessages.length,
        averageLength: Math.round(avgLength),
        overallSentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        emotions: sentiment.emotions || [],
        emotionalTrend,
        speakingPatterns,
        recommendations: getVoiceRecommendations(emotionalTrend, speakingPatterns)
    };
}

/**
 * Analyze speaking patterns from voice messages
 */
function analyzeSpeakingPatterns(messages) {
    const patterns = {
        frequency: messages.length,
        averageWordsPerMessage: 0,
        timeOfDayPreference: null,
        consistentTopic: null
    };

    if (messages.length === 0) return patterns;

    // Average words
    const totalWords = messages.reduce((sum, m) =>
        sum + (m.content?.split(/\s+/).length || 0), 0);
    patterns.averageWordsPerMessage = Math.round(totalWords / messages.length);

    // Time preference
    const hours = messages
        .filter(m => m.timestamp)
        .map(m => new Date(m.timestamp).getHours());

    if (hours.length > 0) {
        const avgHour = Math.round(hours.reduce((a, b) => a + b, 0) / hours.length);
        if (avgHour >= 5 && avgHour < 12) patterns.timeOfDayPreference = 'morning';
        else if (avgHour >= 12 && avgHour < 17) patterns.timeOfDayPreference = 'afternoon';
        else if (avgHour >= 17 && avgHour < 21) patterns.timeOfDayPreference = 'evening';
        else patterns.timeOfDayPreference = 'night';
    }

    return patterns;
}

/**
 * Get recommendations based on emotional trend and patterns
 */
function getVoiceRecommendations(trend, patterns = {}) {
    const recommendations = [];

    // Based on emotional trend
    if (trend === 'positive') {
        recommendations.push('Keep expressing yourself through voice notes!');
        recommendations.push('Your positive energy is wonderful - consider sharing in a journal too.');
    } else if (trend === 'concerning') {
        recommendations.push('I noticed some stress in your voice notes. Would you like to try a breathing exercise?');
        recommendations.push('Remember, it\'s okay to reach out when things feel heavy.');
        recommendations.push('Consider talking to Serenity about what\'s on your mind.');
    } else {
        recommendations.push('Regular voice journaling helps process emotions.');
        recommendations.push('Try describing how your body feels when you record.');
    }

    // Based on patterns
    if (patterns.averageWordsPerMessage < 20) {
        recommendations.push('Feel free to share more detail in your voice notes - I\'m here to listen.');
    }

    return recommendations.slice(0, 3);
}

/**
 * Get voice service status
 */
function getVoiceStatus() {
    return {
        sttAvailable: !!speechClient,
        ttsAvailable: !!ttsClient,
        hasCredentials: hasGoogleCredentials,
        voiceConfig: SERENITY_VOICE_CONFIG.google
    };
}

/**
 * Synthesize long text by chunking (for articles)
 * Google TTS has character limits, so we split by sentence/paragraph
 */
async function synthesizeLongText(text, options = {}) {
    // Simple chunking check
    if (text.length < 4000) {
        return synthesizeSpeech(text, options);
    }

    // If text is huge, we'd typically need to return a stream or a combined buffer.
    // For this MVP, we'll just take the first ~4000 characters or summarize.
    // Real implemention would merge audio buffers.

    const truncated = text.substring(0, 4000) + "... (end of preview)";
    return synthesizeSpeech(truncated, options);
}

export const voiceService = {
    transcribeAudio,
    synthesizeSpeech,
    synthesizeLongText,
    generateSerenityVoice,
    analyzeVoiceContent,
    detectEmotionForVoice,
    getVoiceStatus
};

export default voiceService;
