/**
 * Voice Service - Speech-to-Text and Text-to-Speech processing
 * Uses Google Cloud Speech/Text-to-Speech or falls back to mock
 */

import { analyzeTextSentiment } from '../agents/aiAdapter.js';

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
        } catch (error) {
            console.warn('⚠️ Failed to initialize Google Cloud Speech:', error.message);
        }
    } else {
        console.warn('⚠️ Google Cloud credentials not found. Voice services will use mock responses.');
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

            const request = {
                audio: { content: audioBytes },
                config: {
                    encoding: encodingType,
                    sampleRateHertz: 48000,
                    languageCode,
                    enableAutomaticPunctuation: true,
                    model: 'latest_long'
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
            console.error('Google STT error:', error);
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
        "I've been feeling a bit stressed lately with work.",
        "Today was actually a pretty good day, I went for a walk.",
        "I'm having trouble sleeping and it's affecting my mood.",
        "I practiced the breathing exercises and they really helped.",
        "I want to talk about some anxiety I've been experiencing."
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
 * Convert text to speech audio
 * @param {string} text - Text to synthesize
 * @param {Object} options - Synthesis options
 * @returns {Object} Audio content result
 */
async function synthesizeSpeech(text, options = {}) {
    const {
        voice = 'en-US-Neural2-F', // Female neural voice
        speakingRate = 1.0,
        pitch = 0
    } = options;

    // Use Google Cloud if available
    if (ttsClient) {
        try {
            const request = {
                input: { text },
                voice: {
                    languageCode: 'en-US',
                    name: voice
                },
                audioConfig: {
                    audioEncoding: 'MP3',
                    speakingRate,
                    pitch
                }
            };

            const [response] = await ttsClient.synthesizeSpeech(request);

            return {
                success: true,
                audioContent: response.audioContent.toString('base64'),
                contentType: 'audio/mp3'
            };
        } catch (error) {
            console.error('Google TTS error:', error);
            return getMockSynthesis();
        }
    }

    // Mock synthesis for testing
    return getMockSynthesis();
}

/**
 * Mock synthesis for testing without Google Cloud
 */
function getMockSynthesis() {
    return {
        success: true,
        audioContent: null, // Would be base64 audio in production
        contentType: 'audio/mp3',
        mock: true,
        message: 'TTS not available. Text would be spoken: [mock audio]'
    };
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

    return {
        success: true,
        messageCount: voiceMessages.length,
        averageLength: Math.round(avgLength),
        overallSentiment: sentiment.sentiment,
        sentimentScore: sentiment.score,
        emotions: sentiment.emotions || [],
        emotionalTrend,
        recommendations: getVoiceRecommendations(emotionalTrend)
    };
}

/**
 * Get recommendations based on emotional trend
 */
function getVoiceRecommendations(trend) {
    const recommendations = {
        positive: [
            'Keep expressing yourself through voice notes!',
            'Consider sharing positive moments in your journal too.'
        ],
        neutral: [
            'Regular voice journaling helps process emotions.',
            'Try describing how your body feels when you record.'
        ],
        concerning: [
            'Your voice notes show some stress. Consider a breathing exercise.',
            'It might help to talk to Serenity about what\'s on your mind.',
            'Remember, seeking support is a sign of strength.'
        ]
    };

    return recommendations[trend] || recommendations.neutral;
}

export const voiceService = {
    transcribeAudio,
    synthesizeSpeech,
    analyzeVoiceContent
};

export default voiceService;
