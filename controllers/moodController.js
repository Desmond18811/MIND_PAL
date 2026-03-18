import MoodEntry from '../models/MoodEntry.js';
import mongoose from 'mongoose';
import { updateScore } from './palScoreController.js';

// Record a mood entry
export const recordMood = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { moodValue, moodLabel, factors, notes, activities } = req.body;
        const userId = req.user._id;

        // Check if mood already recorded today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingEntry = await MoodEntry.findOne({
            userId,
            datetime: { $gte: today }
        }).session(session);

        if (existingEntry) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Mood already recorded today' });
        }

        const entry = await MoodEntry.create([{
            userId,
            moodValue,
            moodLabel,
            factors,
            notes,
            activities
        }], { session });

        // Update Freud score for daily check-in
        await updateScore(userId, {
            type: 'check-in',
            _id: entry[0]._id,
            moodValue: moodValue,
            activities
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

// Get mood history
export const getMoodHistory = async (req, res) => {
    try {
        const { range = 'month' } = req.query;
        const userId = req.user._id;

        let dateFilter = {};
        const now = new Date();

        if (range === 'week') {
            const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
            dateFilter = { $gte: oneWeekAgo };
        } else if (range === 'month') {
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
            dateFilter = { $gte: oneMonthAgo };
        } else if (range === 'year') {
            const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            dateFilter = { $gte: oneYearAgo };
        }

        const history = await MoodEntry.find({
            userId,
            datetime: dateFilter
        }).sort({ datetime: 1 });

        // Calculate statistics
        const stats = {
            averageMood: history.length > 0 ?
                history.reduce((sum, entry) => sum + entry.moodValue, 0) / history.length : null,
            mostCommonFactors: getMostCommonFactors(history),
            moodFrequency: getMoodFrequency(history),
            streak: await calculateMoodStreak(userId)
        };

        res.json({ history, stats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper functions
function getMostCommonFactors(entries) {
    const factorCounts = {};
    entries.forEach(entry => {
        if (entry.factors) {
            Object.entries(entry.factors.toJSON ? entry.factors.toJSON() : entry.factors).forEach(([key, value]) => {
                if (value) {
                    factorCounts[key] = (factorCounts[key] || 0) + value;
                }
            });
        }
    });
    return Object.entries(factorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
}

function getMoodFrequency(entries) {
    const moodCounts = Array(10).fill(0); // 1-10 scale
    entries.forEach(entry => {
        if (entry.moodValue >= 1 && entry.moodValue <= 10) {
            moodCounts[entry.moodValue - 1]++;
        }
    });
    return moodCounts;
}

async function calculateMoodStreak(userId) {
    const entries = await MoodEntry.find({ userId })
        .sort({ datetime: -1 });

    if (entries.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Check if mood recorded today
    const today = new Date().toDateString();
    if (entries[0].datetime.toDateString() === today) {
        streak++;
        currentDate = new Date(currentDate.getTime() - oneDay);
    }

    // Check consecutive previous days
    for (let i = 0; i < entries.length; i++) {
        const entryDate = entries[i].datetime.toDateString();
        const expectedDate = currentDate.toDateString();

        if (entryDate === expectedDate) {
            streak++;
            currentDate = new Date(currentDate.getTime() - oneDay);
        } else if (new Date(entryDate) < new Date(expectedDate)) {
            break;
        }
    }

    return streak;
}