/**
 * Voice Routes - Handle voice note uploads and processing
 */

import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { voiceService } from '../services/voiceService.js';
import { createSerenityAgent } from '../agents/SerenityAgent.js';
import ChatSession from '../models/ChatSession.js';
import authenticate from '../middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for audio file uploads
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept common audio formats
        const allowedMimes = [
            'audio/wav',
            'audio/webm',
            'audio/mp3',
            'audio/mpeg',
            'audio/ogg',
            'audio/m4a',
            'audio/x-m4a'
        ];

        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid audio format. Supported: wav, webm, mp3, ogg, m4a'));
        }
    }
});

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/voice/upload
 * Upload a voice note for transcription and Serenity response
 */
router.post('/upload', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No audio file provided'
            });
        }

        const userId = req.user._id;
        const { sessionId } = req.body;

        // Transcribe the audio
        const transcription = await voiceService.transcribeAudio(req.file.buffer, {
            encoding: req.file.mimetype,
            languageCode: req.body.language || 'en-US'
        });

        if (!transcription.success) {
            return res.status(500).json({
                status: 'error',
                message: 'Failed to transcribe audio',
                details: transcription.error
            });
        }

        // Get or create chat session
        let session;
        if (sessionId) {
            session = await ChatSession.findById(sessionId);
        }
        if (!session) {
            session = new ChatSession({
                userId,
                sessionType: 'voice',
                messages: []
            });
        }

        // Add transcribed message to session and get Serenity response
        const agent = await createSerenityAgent(userId);
        const response = await agent.handleMessage(
            transcription.text,
            session._id,
            'voice'
        );

        // Optionally generate TTS for response
        let audioResponse = null;
        if (req.body.generateAudio === 'true') {
            audioResponse = await voiceService.synthesizeSpeech(response.response);
        }

        res.json({
            status: 'success',
            data: {
                sessionId: response.sessionId,
                transcription: transcription.text,
                confidence: transcription.confidence,
                serenityResponse: response.response,
                audioResponse: audioResponse?.audioContent || null,
                sentiment: response.sentiment,
                timestamp: response.timestamp
            }
        });

    } catch (error) {
        console.error('Voice upload error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process voice note'
        });
    }
});

/**
 * POST /api/voice/transcribe
 * Transcribe audio without Serenity interaction (for journals, etc.)
 */
router.post('/transcribe', upload.single('audio'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                status: 'error',
                message: 'No audio file provided'
            });
        }

        const transcription = await voiceService.transcribeAudio(req.file.buffer, {
            encoding: req.file.mimetype,
            languageCode: req.body.language || 'en-US'
        });

        if (!transcription.success) {
            return res.status(500).json({
                status: 'error',
                message: 'Transcription failed',
                details: transcription.error
            });
        }

        res.json({
            status: 'success',
            data: {
                text: transcription.text,
                confidence: transcription.confidence,
                duration: transcription.duration
            }
        });

    } catch (error) {
        console.error('Transcription error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Transcription failed'
        });
    }
});

/**
 * POST /api/voice/synthesize
 * Convert text to speech (TTS)
 */
router.post('/synthesize', async (req, res) => {
    try {
        const { text, voice, speed } = req.body;

        if (!text || text.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Text is required'
            });
        }

        if (text.length > 5000) {
            return res.status(400).json({
                status: 'error',
                message: 'Text too long. Maximum 5000 characters.'
            });
        }

        const result = await voiceService.synthesizeSpeech(text, {
            voice: voice || 'en-US-Neural2-F',
            speakingRate: parseFloat(speed) || 1.0
        });

        if (!result.success) {
            return res.status(500).json({
                status: 'error',
                message: 'Speech synthesis failed',
                details: result.error
            });
        }

        // Send audio content directly or as base64
        if (req.query.format === 'binary') {
            res.set('Content-Type', 'audio/mp3');
            res.send(Buffer.from(result.audioContent, 'base64'));
        } else {
            res.json({
                status: 'success',
                data: {
                    audioContent: result.audioContent,
                    contentType: 'audio/mp3'
                }
            });
        }

    } catch (error) {
        console.error('Synthesis error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Speech synthesis failed'
        });
    }
});

/**
 * GET /api/voice/analyze/:sessionId
 * Analyze voice notes in a session for patterns
 */
router.get('/analyze/:sessionId', async (req, res) => {
    try {
        const userId = req.user._id;
        const session = await ChatSession.findById(req.params.sessionId);

        if (!session || session.userId.toString() !== userId.toString()) {
            return res.status(404).json({
                status: 'error',
                message: 'Session not found'
            });
        }

        // Get voice messages from session
        const voiceMessages = session.messages.filter(m => m.type === 'voice');

        if (voiceMessages.length === 0) {
            return res.json({
                status: 'success',
                data: {
                    message: 'No voice messages in this session',
                    analysis: null
                }
            });
        }

        // Perform analysis on voice content
        const analysis = await voiceService.analyzeVoiceContent(voiceMessages);

        res.json({
            status: 'success',
            data: {
                messageCount: voiceMessages.length,
                analysis
            }
        });

    } catch (error) {
        console.error('Voice analysis error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Voice analysis failed'
        });
    }
});

export default router;
