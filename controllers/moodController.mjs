import MoodEntry from '../models/MoodEntry.mjs';
import mongoose from 'mongoose';

// Record a mood entry
export const recordMood = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { mood, factors, notes, activities } = req.body;
        const userId = req.user._id;

        // Check if mood already recorded today
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const existingEntry = await MoodEntry.findOne({
            userId,
            date: { $gte: today }
        }).session(session);

        if (existingEntry) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({ error: 'Mood already recorded today' });
        }

        const entry = await MoodEntry.create([{
            userId,
            mood,
            factors,
            notes,
            activities
        }], { session });

        // Update Freud score for daily check-in
        await updateScore(userId, {
            type: 'check-in',
            _id: entry[0]._id,
            moodValue: mood,
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
            date: dateFilter
        }).sort({ date: 1 });

        // Calculate statistics
        const stats = {
            averageMood: history.length > 0 ?
                history.reduce((sum, entry) => sum + entry.mood, 0) / history.length : null,
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
        entry.factors?.forEach(factor => {
            factorCounts[factor] = (factorCounts[factor] || 0) + 1;
        });
    });
    return Object.entries(factorCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 3);
}

function getMoodFrequency(entries) {
    const moodCounts = Array(5).fill(0); // 1-5 scale
    entries.forEach(entry => {
        moodCounts[entry.mood - 1]++;
    });
    return moodCounts;
}

async function calculateMoodStreak(userId) {
    const entries = await MoodEntry.find({ userId })
        .sort({ date: -1 });

    if (entries.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Check if mood recorded today
    const today = new Date().toDateString();
    if (entries[0].date.toDateString() === today) {
        streak++;
        currentDate = new Date(currentDate.getTime() - oneDay);
    }

    // Check consecutive previous days
    for (let i = 0; i < entries.length; i++) {
        const entryDate = entries[i].date.toDateString();
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