import MeditationContent from '../models/MeditationContent.mjs';
import MeditationSession from '../models/MeditationSession.mjs';
import MusicTrack from '../models/MusicTrack.mjs';
import { updateScore } from '../controllers/palScoreController.mjs'

import mongoose from 'mongoose';

// Content Management
export const getMeditationContent = async (req, res) => {
    try {
        const { type, category, mood, difficulty, limit = 10 } = req.query;

        let query = {};
        if (type) query.type = type;
        if (category) query.category = category;
        if (mood) query.moodTarget = mood;
        if (difficulty) query.difficulty = difficulty;

        const content = await MeditationContent.find(query)
            .sort({ averageRating: -1, plays: -1 })
            .limit(parseInt(limit));

        res.json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const createMeditationContent = async (req, res) => {
    try {
        const content = await MeditationContent.create(req.body);
        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Session Management
export const startSession = async (req, res) => {
    try {
        const { contentId, moodBefore, heartRateBefore, deviceInfo } = req.body;
        const userId = req.user._id;

        const session = await MeditationSession.create({
            userId,
            contentId,
            moodBefore,
            heartRateBefore,
            deviceInfo,
            startTime: new Date()
        });

        // Increment play count if content is specified
        if (contentId) {
            await MeditationContent.findByIdAndUpdate(contentId, { $inc: { plays: 1 } });
        }

        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const endSession = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { sessionId, moodAfter, heartRateAfter, notes } = req.body;
        const userId = req.user._id;

        const meditationSession = await MeditationSession.findOneAndUpdate(
            { _id: sessionId, userId },
            {
                endTime: new Date(),
                moodAfter,
                heartRateAfter,
                notes,
                isCompleted: true
            },
            { new: true, session }
        );

        if (!meditationSession) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Session not found' });
        }

        // Calculate duration in minutes
        const duration = meditationSession.endTime && meditationSession.startTime
            ? Math.round((meditationSession.endTime - meditationSession.startTime) / (1000 * 60))
            : 0;

        // Update Pal score based on session
        await updateScore(userId, {
            type: 'meditation',
            duration: duration,
            moodImprovement: moodAfter > meditationSession.moodBefore
        });

        await session.commitTransaction();
        session.endSession();

        res.json(meditationSession);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({ error: error.message });
    }
};
// Progress Tracking
export const getUserProgress = async (req, res) => {
    try {
        const userId = req.user._id;
        const { range = 'month' } = req.query;

        let dateFilter = {};
        const now = new Date();

        if (range === 'week') {
            const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
            dateFilter = { $gte: oneWeekAgo };
        } else if (range === 'month') {
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
            dateFilter = { $gte: oneMonthAgo };
        }

        const sessions = await MeditationSession.find({
            userId,
            isCompleted: true,
            startTime: dateFilter
        });

        // Calculate statistics
        const totalDuration = sessions.reduce((sum, session) => sum + (session.duration || 0), 0);
        const averageDuration = sessions.length > 0 ? totalDuration / sessions.length : 0;

        const typeDistribution = sessions.reduce((acc, session) => {
            const type = session.contentId?.type || 'unknown';
            acc[type] = (acc[type] || 0) + 1;
            return acc;
        }, {});

        const moodImprovement = sessions.length > 0 ?
            sessions.reduce((sum, session) => {
                if (session.moodAfter && session.moodBefore) {
                    return sum + (session.moodAfter - session.moodBefore);
                }
                return sum;
            }, 0) / sessions.length : 0;

        res.json({
            totalSessions: sessions.length,
            totalDuration,
            averageDuration,
            typeDistribution,
            moodImprovement,
            streak: await calculateMeditationStreak(userId)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Personalization
export const getRecommendations = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get user's recent sessions and preferences
        const recentSessions = await MeditationSession.find({ userId })
            .sort({ startTime: -1 })
            .limit(5)
            .populate('contentId');

        // Simple recommendation algorithm (can be enhanced with ML)
        let recommendedType = 'guided';
        let recommendedCategory = 'stress';

        if (recentSessions.length > 0) {
            // Find most frequent type
            const typeCounts = {};
            recentSessions.forEach(session => {
                const type = session.contentId?.type;
                if (type) typeCounts[type] = (typeCounts[type] || 0) + 1;
            });

            recommendedType = Object.entries(typeCounts)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'guided';

            // Find most frequent category with mood improvement
            const categoryScores = {};
            recentSessions.forEach(session => {
                if (session.contentId?.category && session.moodAfter && session.moodBefore) {
                    const improvement = session.moodAfter - session.moodBefore;
                    categoryScores[session.contentId.category] =
                        (categoryScores[session.contentId.category] || 0) + improvement;
                }
            });

            recommendedCategory = Object.entries(categoryScores)
                .sort((a, b) => b[1] - a[1])[0]?.[0] || 'stress';
        }

        // Get recommended content
        const recommendations = await MeditationContent.find({
            type: recommendedType,
            category: recommendedCategory
        }).limit(5);

        // Get recommended music tracks based on time of day
        const hour = new Date().getHours();
        let musicMood = 'calm';
        if (hour >= 6 && hour < 12) musicMood = 'energizing';
        else if (hour >= 12 && hour < 18) musicMood = 'focus';

        const musicRecommendations = await MusicTrack.find({
            mood: musicMood
        }).limit(5);

        res.json({
            meditation: recommendations,
            music: musicRecommendations
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function to calculate meditation streak
async function calculateMeditationStreak(userId) {
    const sessions = await MeditationSession.find({ userId, isCompleted: true })
        .sort({ startTime: -1 });

    if (sessions.length === 0) return 0;

    let streak = 0;
    let currentDate = new Date();
    const oneDay = 24 * 60 * 60 * 1000;

    // Check if meditated today
    const today = new Date().toDateString();
    if (sessions[0].startTime.toDateString() === today) {
        streak++;
        currentDate = new Date(currentDate.getTime() - oneDay);
    }

    // Check consecutive previous days
    for (let i = 0; i < sessions.length; i++) {
        const sessionDate = sessions[i].startTime.toDateString();
        const expectedDate = currentDate.toDateString();

        if (sessionDate === expectedDate) {
            streak++;
            currentDate = new Date(currentDate.getTime() - oneDay);
        } else if (new Date(sessionDate) < new Date(expectedDate)) {
            break;
        }
    }

    return streak;
}