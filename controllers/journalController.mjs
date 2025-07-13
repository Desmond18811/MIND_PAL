import JournalEntry from '../models/journalEntry.mjs';
import mongoose from 'mongoose';
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import { updateScore } from './palScoreController.mjs';
import User from '../models/User.mjs';
import { analyzeContent } from "../utils/contentAnalysis.mjs";


// Initialize Google Cloud clients
const speechClient = new SpeechClient();
const storage = new Storage();
const BUCKET_NAME = process.env.GCS_BUCKET_NAME || 'your-audio-bucket';

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

// Audio transcription function
async function transcribeAudio(audioRef) {
    try {
        const gcsUri = `gs://${BUCKET_NAME}/${audioRef}`;
        const config = {
            encoding: 'LINEAR16',
            sampleRateHertz: 16000,
            languageCode: 'en-US',
            enableAutomaticPunctuation: true
        };

        const audio = { uri: gcsUri };
        const [operation] = await speechClient.longRunningRecognize({ config, audio });
        const [response] = await operation.promise();

        return {
            content: response.results.map(result => result.alternatives[0].transcript).join('\n'),
            confidence: response.results[0].alternatives[0].confidence
        };
    } catch (error) {
        console.error('Audio transcription failed:', error);
        throw new Error('Failed to transcribe audio');
    }
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
        const { title, moodBefore, moodAfter, tags, musicPlayed, images, audioRef } = req.body;
        const userId = req.user._id;

        if (!moodBefore || !req.body.content) {
            throw new Error('Missing required fields: content and moodBefore are required');
        }

        let content = req.body.content;
        let isVoiceEntry = false;
        let transcriptionConfidence = null;

        if (audioRef) {
            isVoiceEntry = true;
            const transcriptionResult = await transcribeAudio(audioRef);
            content = transcriptionResult.content;
            transcriptionConfidence = transcriptionResult.confidence;
        }


        const { sentimentScore, keywords } = await analyzeContent(content);
        const wordCount = content.split(/\s+/).length;

        const [entry] = await JournalEntry.create([{
            userId,
            title: title || 'Untitled Entry',
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
            wordCount
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
                moodImprovement: moodAfter ? (moodAfter - moodBefore) : null
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

        // Get context entries
        const startDate = new Date(entry.createdAt);
        startDate.setDate(startDate.getDate() - 3);
        const endDate = new Date(entry.createdAt);
        endDate.setDate(endDate.getDate() + 3);

        const contextEntries = await JournalEntry.find({
            userId,
            createdAt: { $gte: startDate, $lte: endDate },
            _id: { $ne: entry._id }
        }).sort({ createdAt: 1 });

        res.json({
            status: 'success',
            data: {
                entry,
                context: {
                    entries: contextEntries,
                    streak: await calculateJournalStreak(userId)
                }
            }
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
            wordCount: entry.wordCount
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
            byHour: Array(24).fill(0)
        };

        entries.forEach(entry => {
            const day = entry.createdAt.getDay();
            const hour = entry.createdAt.getHours();
            writingHabits.byDayOfWeek[day]++;
            writingHabits.byHour[hour]++;
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