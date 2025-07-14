import JournalEntry from '../models/journalEntry.mjs';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import multer from 'multer';
import { updateScore } from './palScoreController.mjs';
import User from '../models/User.mjs';
import { analyzeContent } from "../utils/contentAnalysis.mjs";
import { MongoClient } from 'mongodb';

// Initialize MongoDB GridFS
const client = new MongoClient(process.env.DB_URI);
let gfsBucket;

client.connect().then(() => {
    gfsBucket = new GridFSBucket(client.db(), { bucketName: 'audio' });
});

// Configure Multer for file uploads
const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('audio/')) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed!'), false);
        }
    }
});

// Audio upload handler
export const handleAudioUpload = (req, res, next) => {
    upload.single('audio')(req, res, async (err) => {
        if (err) return next(err);
        if (!req.file) return next();

        try {
            const fileName = `audio_${req.user._id}_${Date.now()}`;
            const uploadStream = gfsBucket.openUploadStream(fileName, {
                contentType: req.file.mimetype
            });

            uploadStream.end(req.file.buffer);

            uploadStream.on('finish', () => {
                req.body.audioRef = fileName;
                req.body.isVoiceEntry = true;
                next();
            });

            uploadStream.on('error', (error) => {
                throw new Error('Audio upload failed');
            });
        } catch (error) {
            next(error);
        }
    });
};

// Mock transcription for development
async function mockTranscribe() {
    return {
        content: "This is a mock transcription of your audio journal entry.",
        confidence: 0.85
    };
}

// Audio transcription function
async function transcribeAudio(audioRef) {
    try {
        if (process.env.NODE_ENV === 'development') {
            return await mockTranscribe();
        }

        const audioStream = gfsBucket.openDownloadStreamByName(audioRef);
        const audioChunks = [];

        for await (const chunk of audioStream) {
            audioChunks.push(chunk);
        }

        const audioBuffer = Buffer.concat(audioChunks);

        // Implement your preferred transcription service here
        // Example: self-hosted Whisper.cpp
        const response = await fetch('http://localhost:3000/transcribe', {
            method: 'POST',
            body: audioBuffer,
            headers: {
                'Content-Type': 'audio/wav'
            }
        });

        return await response.json();

    } catch (error) {
        console.error('Audio transcription failed:', error);
        throw new Error('Failed to transcribe audio');
    }
}

// Helper function for date ranges
function getDateRange(period) {
    const now = new Date();
    const ranges = {
        'day': { start: new Date(now.setDate(now.getDate() - 1)), end: new Date() },
        'week': { start: new Date(now.setDate(now.getDate() - 7)), end: new Date() },
        'month': { start: new Date(now.setMonth(now.getMonth() - 1)), end: new Date() },
        'year': { start: new Date(now.setFullYear(now.getFullYear() - 1)), end: new Date() }
    };
    return ranges[period] || ranges.month;
}

// Update user journal insights
async function updateUserJournalInsights(userId, { sentiment, moodChange, wordCount, tags }) {
    await User.findByIdAndUpdate(userId, {
        $inc: {
            'insights.totalJournalEntries': 1,
            'insights.totalWordsWritten': wordCount,
            'insights.positiveSentimentCount': sentiment > 0 ? 1 : 0,
            'insights.negativeSentimentCount': sentiment < 0 ? 1 : 0
        },
        $push: {
            'insights.recentMoodChanges': { $each: [moodChange], $slice: -100 },
            'insights.usedTags': { $each: tags || [] }
        },
        $set: {
            'insights.lastJournalDate': new Date()
        }
    });
}

// Calculate journal streak
async function calculateJournalStreak(userId) {
    const entries = await JournalEntry.find({ userId })
        .sort({ date: -1 })
        .limit(30);

    if (entries.length === 0) return 0;

    let streak = 0;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let currentDate = new Date(entries[0].date);
    currentDate.setHours(0, 0, 0, 0);

    if (currentDate.getTime() === today.getTime()) {
        streak++;
    } else {
        return 0;
    }

    for (let i = 1; i < entries.length; i++) {
        const prevDate = new Date(entries[i].date);
        prevDate.setHours(0, 0, 0, 0);

        const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

        if (dayDiff === 1) {
            streak++;
            currentDate = prevDate;
        } else if (dayDiff > 1) {
            break;
        }
    }

    return streak;
}

// Calculate mood correlation
function calculateMoodCorrelation(entries) {
    const validEntries = entries.filter(e => e.moodAfter && e.sentimentScore);
    if (validEntries.length < 2) return null;

    const moodMean = validEntries.reduce((sum, e) => sum + e.moodAfter, 0) / validEntries.length;
    const sentimentMean = validEntries.reduce((sum, e) => sum + e.sentimentScore, 0) / validEntries.length;

    let covariance = 0;
    let moodVariance = 0;
    let sentimentVariance = 0;

    validEntries.forEach(e => {
        const moodDiff = e.moodAfter - moodMean;
        const sentimentDiff = e.sentimentScore - sentimentMean;
        covariance += moodDiff * sentimentDiff;
        moodVariance += moodDiff * moodDiff;
        sentimentVariance += sentimentDiff * sentimentDiff;
    });

    return covariance / Math.sqrt(moodVariance * sentimentVariance);
}

// Create journal entry
export async function createJournalEntry(req, res) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { title, moodBefore, moodAfter, tags, musicPlayed, images } = req.body;
        const userId = req.user._id;

        if (!moodBefore) {
            throw new Error('Missing required field: moodBefore');
        }

        let content = req.body.content || "";
        let isVoiceEntry = !!req.body.audioRef;
        let transcriptionConfidence = null;

        if (isVoiceEntry) {
            const transcriptionResult = await transcribeAudio(req.body.audioRef);
            content = transcriptionResult.content;
            transcriptionConfidence = transcriptionResult.confidence;
        } else if (!content) {
            throw new Error('Either content or audio file is required');
        }

        const { sentimentScore, keywords } = await analyzeContent(content);
        const wordCount = content.split(/\s+/).length;

        const [entry] = await JournalEntry.create([{
            userId,
            title: title || (isVoiceEntry ? 'Voice Entry' : 'Untitled Entry'),
            content,
            moodBefore: parseInt(moodBefore),
            moodAfter: moodAfter ? parseInt(moodAfter) : null,
            tags: tags || [],
            musicPlayed,
            images: images || [],
            sentimentScore,
            isVoiceEntry,
            transcriptionConfidence,
            keywords,
            wordCount,
            audioRef: req.body.audioRef || null
        }], { session });

        await updateUserJournalInsights(userId, {
            sentiment: sentimentScore,
            moodChange: moodAfter ? (moodAfter - moodBefore) : 0,
            wordCount,
            tags
        });

        await updateScore(userId, {
            type: 'journal',
            entryId: entry._id,
            wordCount,
            moodImprovement: moodAfter ? (moodAfter > moodBefore) : null,
            sentimentScore
        });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            status: 'success',
            data: {
                ...entry.toObject(),
                moodImprovement: moodAfter ? (moodAfter - moodBefore) : null,
                audioUrl: isVoiceEntry ? `/api/journal/${entry._id}/audio` : null
            }
        });

    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Journal creation error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create journal entry',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Get journal entry
export async function getJournalEntry(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const entry = await JournalEntry.findOne({ _id: id, userId });

        if (!entry) {
            return res.status(404).json({
                status: 'error',
                message: 'Journal entry not found'
            });
        }

        const responseData = {
            ...entry.toObject(),
            context: {
                streak: await calculateJournalStreak(userId)
            }
        };

        if (entry.isVoiceEntry && entry.audioRef) {
            responseData.audioUrl = `/api/journal/${entry._id}/audio`;
        }

        res.json({
            status: 'success',
            data: responseData
        });

    } catch (error) {
        console.error('Get entry error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get journal entry',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Stream audio file
export async function streamAudio(req, res) {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const entry = await JournalEntry.findOne({ _id: id, userId });
        if (!entry || !entry.audioRef) {
            return res.status(404).json({
                status: 'error',
                message: 'Audio not found'
            });
        }

        res.set('Content-Type', 'audio/mpeg');
        const downloadStream = gfsBucket.openDownloadStreamByName(entry.audioRef);
        downloadStream.pipe(res);

    } catch (error) {
        console.error('Audio stream error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to stream audio',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}

// Get journal analytics
export async function getJournalAnalytics(req, res) {
    try {
        const userId = req.user._id;
        const { period = 'month' } = req.query;
        const dateRange = getDateRange(period);

        const entries = await JournalEntry.find({
            userId,
            createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        }).sort({ createdAt: 1 });

        // Sentiment timeline
        const sentimentTimeline = entries.map(entry => ({
            date: entry.createdAt,
            score: entry.sentimentScore,
            moodBefore: entry.moodBefore,
            moodAfter: entry.moodAfter,
            wordCount: entry.wordCount,
            type: entry.isVoiceEntry ? 'voice' : 'text'
        }));

        // Tag frequency
        const tagFrequency = entries.reduce((acc, entry) => {
            entry.tags.forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});

        // Writing habits
        const writingHabits = {
            byDayOfWeek: Array(7).fill(0),
            byHour: Array(24).fill(0),
            byType: { text: 0, voice: 0 }
        };

        entries.forEach(entry => {
            const day = entry.createdAt.getDay();
            const hour = entry.createdAt.getHours();
            writingHabits.byDayOfWeek[day]++;
            writingHabits.byHour[hour]++;
            writingHabits.byType[entry.isVoiceEntry ? 'voice' : 'text']++;
        });

        res.json({
            status: 'success',
            data: {
                period,
                totalEntries: entries.length,
                averageSentiment: entries.reduce((sum, e) => sum + e.sentimentScore, 0) / entries.length || 0,
                averageWordCount: entries.reduce((sum, e) => sum + e.wordCount, 0) / entries.length || 0,
                moodCorrelation: calculateMoodCorrelation(entries),
                tagFrequency,
                sentimentTimeline,
                writingHabits,
                currentStreak: await calculateJournalStreak(userId)
            }
        });

    } catch (error) {
        console.error('Analytics error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get analytics',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
}
