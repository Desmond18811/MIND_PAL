import JournalEntry from '../models/journalEntry.mjs';
import natural from 'natural';
import mongoose from 'mongoose';
import { SpeechClient } from '@google-cloud/speech';
import { Storage } from '@google-cloud/storage';
import { updateScore } from './palScoreController.mjs';

// Initialize NLP tools
const analyzer = new natural.SentimentAnalyzer("English", natural.PorterStemmer, "afinn");
const stemmer = natural.PorterStemmer;
const tokenizer = new natural.WordTokenizer();

// Google Cloud setup for voice processing
const speechClient = new SpeechClient();
const storage = new Storage();
const BUCKET_NAME = 'your-audio-bucket';

// Create journal entry (supports both text and voice)
export const createJournalEntry = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { title, moodBefore, moodAfter, tags, musicPlayed, images, audioRef } = req.body;
        const userId = req.user._id;

        let content = req.body.content;
        let isVoiceEntry = false;

        // Process voice recording if provided
        if (audioRef) {
            isVoiceEntry = true;
            content = await transcribeAudio(audioRef);
        }

        // Analyze sentiment and extract keywords
        const { sentimentScore, keywords } = await analyzeContent(content);

        const entry = await JournalEntry.create([{
            userId,
            title,
            content,
            moodBefore,
            moodAfter,
            tags,
            musicPlayed,
            images,
            sentimentScore,
            isVoiceEntry,
            keywords
        }], { session });

        // Update user insights
        await updateUserJournalInsights(userId, {
            sentiment: sentimentScore,
            moodChange: moodAfter - moodBefore,
            wordCount: content.split(/\s+/).length,
            tags
        });

        // Update Freud score
        await updateScore(userId, {
            type: 'journal',
            _id: entry[0]._id,
            wordCount: entry[0].wordCount,
            moodImprovement: moodAfter > moodBefore,
            sentimentScore
        });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(entry[0]);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: error.message });
    }
};

// Enhanced journal analytics
export const getJournalAnalytics = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'month' } = req.query;

        const dateRange = getDateRange(period);
        const entries = await JournalEntry.find({
            userId,
            createdAt: { $gte: dateRange.start, $lte: dateRange.end }
        });

        // Sentiment analysis
        const sentimentData = entries.map(entry => ({
            date: entry.createdAt,
            score: entry.sentimentScore,
            type: entry.isVoiceEntry ? 'voice' : 'text'
        }));

        // Mood correlation
        const moodCorrelation = calculateMoodCorrelation(entries);

        // Writing habits
        const writingHabits = analyzeWritingHabits(entries);

        res.json({
            stats: {
                totalEntries: entries.length,
                voiceEntries: entries.filter(e => e.isVoiceEntry).length,
                averageWordCount: entries.reduce((sum, e) => sum + e.wordCount, 0) / entries.length,
                mostUsedTags: getMostUsedTags(entries),
                streak: await calculateJournalStreak(userId)
            },
            sentimentData,
            moodCorrelation,
            writingHabits
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper functions
async function transcribeAudio(audioRef) {
    const gcsUri = `gs://${BUCKET_NAME}/${audioRef}`;
    const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: 'en-US',
    };
    const audio = { uri: gcsUri };
    const [response] = await speechClient.recognize({ config, audio });
    return response.results.map(result => result.alternatives[0].transcript).join('\n');
}

async function analyzeContent(content) {
    const tokens = tokenizer.tokenize(content);
    const stems = tokens.map(token => stemmer.stem(token));
    const sentimentScore = analyzer.getSentiment(stems);

    // Simple keyword extraction (could be enhanced with TF-IDF)
    const keywords = [...new Set(stems)]
        .filter(term => term.length > 3)
        .slice(0, 5);

    return { sentimentScore, keywords };
}

function calculateMoodCorrelation(entries) {
    // Analyze correlation between journal sentiment and mood
    const data = entries.filter(e => e.moodAfter && e.sentimentScore)
        .map(e => ({
            mood: e.moodAfter,
            sentiment: e.sentimentScore
        }));

    // Simple correlation calculation
    if (data.length < 2) return null;

    const moodMean = data.reduce((sum, d) => sum + d.mood, 0) / data.length;
    const sentimentMean = data.reduce((sum, d) => sum + d.sentiment, 0) / data.length;

    let numerator = 0;
    let moodDenominator = 0;
    let sentimentDenominator = 0;

    for (const d of data) {
        numerator += (d.mood - moodMean) * (d.sentiment - sentimentMean);
        moodDenominator += Math.pow(d.mood - moodMean, 2);
        sentimentDenominator += Math.pow(d.sentiment - sentimentMean, 2);
    }

    return numerator / Math.sqrt(moodDenominator * sentimentDenominator);
}



// Get a specific journal entry with skipped day information
export const getJournalEntry = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        // Get the requested entry
        const entry = await JournalEntry.findOne({
            _id: id,
            userId
        });

        if (!entry) {
            return res.status(404).json({ error: 'Journal entry not found' });
        }

        // Get surrounding dates to identify skipped days
        const adjacentEntries = await JournalEntry.find({
            userId,
            date: {
                $gte: new Date(new Date(entry.date).setDate(entry.date.getDate() - 3)),
                $lte: new Date(new Date(entry.date).setDate(entry.date.getDate() + 3))
            }
        }).sort({ date: 1 });

        // Identify skipped days in this period
        const skippedDays = [];
        for (let i = 1; i < adjacentEntries.length; i++) {
            const prevDate = adjacentEntries[i-1].date;
            const currentDate = adjacentEntries[i].date;
            const dayDiff = (currentDate - prevDate) / (1000 * 60 * 60 * 24);

            if (dayDiff > 1) {
                // Add all missing days between entries
                for (let d = 1; d < dayDiff; d++) {
                    const skippedDate = new Date(prevDate);
                    skippedDate.setDate(skippedDate.getDate() + d);
                    skippedDays.push({
                        date: skippedDate,
                        reason: 'not_written', // Could be enhanced with more context
                        streakImpact: true
                    });
                }
            }
        }

        // Check if today is being skipped
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const lastEntry = await JournalEntry.findOne({ userId })
            .sort({ date: -1 });

        if (lastEntry && lastEntry.date < today) {
            const lastEntryDate = new Date(lastEntry.date);
            lastEntryDate.setHours(0, 0, 0, 0);

            const daysSinceLastEntry = (today - lastEntryDate) / (1000 * 60 * 60 * 24);
            if (daysSinceLastEntry >= 1) {
                for (let d = 1; d <= daysSinceLastEntry; d++) {
                    const skippedDate = new Date(lastEntryDate);
                    skippedDate.setDate(skippedDate.getDate() + d);
                    skippedDays.push({
                        date: skippedDate,
                        reason: 'not_written',
                        streakImpact: true,
                        isToday: skippedDate.toDateString() === today.toDateString()
                    });
                }
            }
        }

        res.json({
            entry,
            context: {
                adjacentEntries: adjacentEntries.map(e => ({
                    id: e._id,
                    date: e.date,
                    title: e.title,
                    preview: e.content.substring(0, 50) + '...',
                    moodAfter: e.moodAfter
                })),
                skippedDays,
                streakStatus: await calculateJournalStreak(userId)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};