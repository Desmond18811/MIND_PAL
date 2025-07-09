import PalScore from '../models/PalScore.mjs';
import mongoose from 'mongoose';

// Update PalScore based on user activity
export const updateScore = async (userId, activity) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        console.log('updateScore called with:', { userId, activity });

        // Calculate score impact based on activity type
        let impact = 0;
        let notes = '';
        let activityTypeForHistory = activity.type; // Default

        switch (activity.type) {
            case 'journal':
                impact = activity.wordCount > 300 ? 5 : 3;
                notes = `Journal entry: ${activity.wordCount} words`;
                break;
            case 'meditation':
                impact = Math.min(10, Math.floor(activity.duration / 5));
                notes = `Meditation: ${activity.duration} minutes`;
                break;
            case 'goal-set':
            case 'goal-completed':
                impact = activity.difficulty === 'hard' ? 8 :
                    activity.difficulty === 'medium' ? 5 : 3;
                notes = `${activity.type === 'goal-set' ? 'Goal set' : 'Goal completed'}: ${activity.title || 'Untitled'}`;
                activityTypeForHistory = 'goal'; // Map to schema's enum value
                break;
            case 'chat':
                impact = 2;
                if (activity.sentimentScore > 0.7) impact += 3;
                notes = `Chat with Serenity: ${activity.messageCount} messages`;
                break;
            case 'suggestion':
                impact = activity.impact || 5;
                notes = `Completed suggestion: ${activity.title || 'Untitled'}`;
                break;
            case 'check-in':
                impact = activity.moodImprovement ? 4 : 2;
                notes = `Daily check-in: Mood ${activity.moodImprovement ? 'improved' : 'stable'}`;
                break;
            default:
                impact = 3;
                notes = `Unknown activity: ${activity.type}`;
        }

        // Cap the impact
        impact = Math.min(10, Math.max(1, impact));

        // Get or create a PalScore document
        let palScore = await PalScore.findOne({ userId }).session(session);

        if (!palScore) {
            console.log('Creating new PalScore for userId:', userId);
            palScore = new PalScore({ userId, currentScore: 50 });
        }

        // Calculate a new score (weighted average)
        const newScore = Math.min(100, Math.max(0,
            Math.round(palScore.currentScore * 0.9 + impact * 2.5)
        ));

        // Add to history
        palScore.history.push({
            score: newScore,
            activityType: activityTypeForHistory, // Use mapped activity type
            activityId: activity._id,
            notes,
            impact
        });

        // Update current score
        palScore.currentScore = newScore;

        await palScore.save({ session });
        await session.commitTransaction();
        session.endSession();

        console.log('PalScore updated successfully:', { userId, newScore, activityType: activityTypeForHistory });
        return palScore;
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Error updating PalScore:', error);
        throw error;
    }
};

// Get current PalScore and trends
export const getPalScore = async (req, res) => {
    try {
        const userId = req.user._id;

        const palScore = await PalScore.findOne({ userId })
            .sort({ 'history.date': -1 })
            .limit(30); // Get last 30 entries

        if (!palScore) {
            return res.status(200).json({
                currentScore: 50,
                history: [],
                trends: {
                    weeklyAverage: 50,
                    monthlyAverage: 50,
                    improvementRate: 0
                }
            });
        }

        res.json(palScore);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get PalScore history with filters
export const getScoreHistory = async (req, res) => {
    try {
        const userId = req.user._id;
        const { range = 'month', activityType } = req.query;

        const palScore = await PalScore.findOne({ userId });
        if (!palScore) return res.json([]);

        let history = palScore.history;

        // Filter by activity type if specified
        if (activityType) {
            history = history.filter(entry => entry.activityType === activityType);
        }

        // Filter by date range
        const now = new Date();
        if (range === 'week') {
            const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
            history = history.filter(entry => entry.date >= oneWeekAgo);
        } else if (range === 'month') {
            const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
            history = history.filter(entry => entry.date >= oneMonthAgo);
        } else if (range === 'year') {
            const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
            history = history.filter(entry => entry.date >= oneYearAgo);
        }

        res.json(history);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get PalScore insights and analytics
export const getScoreInsights = async (req, res) => {
    try {
        const userId = req.user._id;

        const palScore = await PalScore.findOne({ userId });
        if (!palScore) {
            return res.json({
                currentStreak: 0,
                bestActivity: null,
                consistency: 0,
                overallTrend: 'stable'
            });
        }

        // Calculate current streak (days with activity)
        let currentStreak = 0;
        const today = new Date().toDateString();
        let datePointer = new Date();

        while (true) {
            const dateStr = datePointer.toDateString();
            if (dateStr === today ||
                palScore.history.some(entry => entry.date.toDateString() === dateStr)) {
                currentStreak++;
                datePointer.setDate(datePointer.getDate() - 1);
            } else {
                break;
            }
        }

        // Find the most impactful activity type
        const activityImpacts = {};
        palScore.history.forEach(entry => {
            activityImpacts[entry.activityType] =
                (activityImpacts[entry.activityType] || 0) + entry.impact;
        });

        let bestActivity = null;
        let maxImpact = 0;
        for (const [type, impact] of Object.entries(activityImpacts)) {
            if (impact > maxImpact) {
                maxImpact = impact;
                bestActivity = type;
            }
        }

        // Calculate consistency (percentage of days with activity)
        const firstDate = palScore.history.length > 0 ?
            new Date(Math.min(...palScore.history.map(entry => entry.date))) :
            new Date();
        const totalDays = Math.ceil((new Date() - firstDate) / (1000 * 60 * 60 * 24)) + 1;
        const activeDays = new Set(palScore.history.map(entry =>
            entry.date.toDateString())).size;
        const consistency = Math.round((activeDays / totalDays) * 100);

        // Determine overall trend
        let overallTrend = 'stable';
        if (palScore.trends.improvementRate > 5) {
            overallTrend = 'improving';
        } else if (palScore.trends.improvementRate < -5) {
            overallTrend = 'declining';
        }

        res.json({
            currentStreak,
            bestActivity,
            consistency,
            overallTrend,
            weeklyAverage: palScore.trends.weeklyAverage,
            monthlyAverage: palScore.trends.monthlyAverage
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};



// import PalScore from '../models/PalScore.mjs';
// import mongoose from 'mongoose';
//
// // Update PalScore based on user activity
// export const updateScore = async (userId, activity) => {
//     const session = await mongoose.startSession();
//     session.startTransaction();
//
//     try {
//         console.log('updateScore called with:', { userId, activity });
//
//         // Calculate score impact based on activity type
//         let impact = 0;
//         let notes = '';
//
//         switch (activity.type) {
//             case 'journal':
//                 impact = activity.wordCount > 300 ? 5 : 3;
//                 notes = `Journal entry: ${activity.wordCount} words`;
//                 break;
//             case 'meditation':
//                 impact = Math.min(10, Math.floor(activity.duration / 5));
//                 notes = `Meditation: ${activity.duration} minutes`;
//                 break;
//             case 'goal-set':
//             case 'goal-completed':
//                 impact = activity.difficulty === 'hard' ? 8 :
//                     activity.difficulty === 'medium' ? 5 : 3;
//                 notes = `${activity.type === 'goal-set' ? 'Goal set' : 'Goal completed'}: ${activity.title || 'Untitled'}`;
//                 break;
//             case 'chat':
//                 impact = 2;
//                 if (activity.sentimentScore > 0.7) impact += 3;
//                 notes = `Chat with Serenity: ${activity.messageCount} messages`;
//                 break;
//             case 'suggestion':
//                 impact = activity.impact || 5;
//                 notes = `Completed suggestion: ${activity.title || 'Untitled'}`;
//                 break;
//             case 'check-in':
//                 impact = activity.moodImprovement ? 4 : 2;
//                 notes = `Daily check-in: Mood ${activity.moodImprovement ? 'improved' : 'stable'}`;
//                 break;
//             default:
//                 impact = 3;
//                 notes = `Unknown activity: ${activity.type}`;
//         }
//
//         // Cap the impact
//         impact = Math.min(10, Math.max(1, impact));
//
//         // Get or create a PalScore document
//         let palScore = await PalScore.findOne({ userId }).session(session);
//
//         if (!palScore) {
//             console.log('Creating new PalScore for userId:', userId);
//             palScore = new PalScore({ userId, currentScore: 50 });
//         }
//
//         // Calculate a new score (weighted average)
//         const newScore = Math.min(100, Math.max(0,
//             Math.round(palScore.currentScore * 0.9 + impact * 2.5)
//         ));
//
//         // Add to history
//         palScore.history.push({
//             score: newScore,
//             activityType: activity.type,
//             activityId: activity._id,
//             notes,
//             impact
//         });
//
//         // Update current score
//         palScore.currentScore = newScore;
//
//         await palScore.save({ session });
//         await session.commitTransaction();
//         session.endSession();
//
//         console.log('PalScore updated successfully:', { userId, newScore });
//         return palScore;
//     } catch (error) {
//         await session.abortTransaction();
//         session.endSession();
//         console.error('Error updating PalScore:', error);
//         throw error;
//     }
// };
//
// // Get current PalScore and trends
// export const getPalScore = async (req, res) => {
//     try {
//         const userId = req.user._id;
//
//         const palScore = await PalScore.findOne({ userId })
//             .sort({ 'history.date': -1 })
//             .limit(30); // Get last 30 entries
//
//         if (!palScore) {
//             return res.status(200).json({
//                 currentScore: 50,
//                 history: [],
//                 trends: {
//                     weeklyAverage: 50,
//                     monthlyAverage: 50,
//                     improvementRate: 0
//                 }
//             });
//         }
//
//         res.json(palScore);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
//
// // Get PalScore history with filters
// export const getScoreHistory = async (req, res) => {
//     try {
//         const userId = req.user._id;
//         const { range = 'month', activityType } = req.query;
//
//         const palScore = await PalScore.findOne({ userId });
//         if (!palScore) return res.json([]);
//
//         let history = palScore.history;
//
//         // Filter by activity type if specified
//         if (activityType) {
//             history = history.filter(entry => entry.activityType === activityType);
//         }
//
//         // Filter by date range
//         const now = new Date();
//         if (range === 'week') {
//             const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
//             history = history.filter(entry => entry.date >= oneWeekAgo);
//         } else if (range === 'month') {
//             const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));
//             history = history.filter(entry => entry.date >= oneMonthAgo);
//         } else if (range === 'year') {
//             const oneYearAgo = new Date(now.setFullYear(now.getFullYear() - 1));
//             history = history.filter(entry => entry.date >= oneYearAgo);
//         }
//
//         res.json(history);
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };
//
// // Get PalScore insights and analytics
// export const getScoreInsights = async (req, res) => {
//     try {
//         const userId = req.user._id;
//
//         const palScore = await PalScore.findOne({ userId });
//         if (!palScore) {
//             return res.json({
//                 currentStreak: 0,
//                 bestActivity: null,
//                 consistency: 0,
//                 overallTrend: 'stable'
//             });
//         }
//
//         // Calculate current streak (days with activity)
//         let currentStreak = 0;
//         const today = new Date().toDateString();
//         let datePointer = new Date();
//
//         while (true) {
//             const dateStr = datePointer.toDateString();
//             if (dateStr === today ||
//                 palScore.history.some(entry => entry.date.toDateString() === dateStr)) {
//                 currentStreak++;
//                 datePointer.setDate(datePointer.getDate() - 1);
//             } else {
//                 break;
//             }
//         }
//
//         // Find the most impactful activity type
//         const activityImpacts = {};
//         palScore.history.forEach(entry => {
//             activityImpacts[entry.activityType] =
//                 (activityImpacts[entry.activityType] || 0) + entry.impact;
//         });
//
//         let bestActivity = null;
//         let maxImpact = 0;
//         for (const [type, impact] of Object.entries(activityImpacts)) {
//             if (impact > maxImpact) {
//                 maxImpact = impact;
//                 bestActivity = type;
//             }
//         }
//
//         // Calculate consistency (percentage of days with activity)
//         const firstDate = palScore.history.length > 0 ?
//             new Date(Math.min(...palScore.history.map(entry => entry.date))) :
//             new Date();
//         const totalDays = Math.ceil((new Date() - firstDate) / (1000 * 60 * 60 * 24)) + 1;
//         const activeDays = new Set(palScore.history.map(entry =>
//             entry.date.toDateString())).size;
//         const consistency = Math.round((activeDays / totalDays) * 100);
//
//         // Determine overall trend
//         let overallTrend = 'stable';
//         if (palScore.trends.improvementRate > 5) {
//             overallTrend = 'improving';
//         } else if (palScore.trends.improvementRate < -5) {
//             overallTrend = 'declining';
//         }
//
//         res.json({
//             currentStreak,
//             bestActivity,
//             consistency,
//             overallTrend,
//             weeklyAverage: palScore.trends.weeklyAverage,
//             monthlyAverage: palScore.trends.monthlyAverage
//         });
//     } catch (error) {
//         res.status(500).json({ error: error.message });
//     }
// };