/**
 * Analysis Service - Data analysis engine for Serenity AI
 * Analyzes sleep, mood, journal, and assessment patterns
 */

import mongoose from 'mongoose';
import { SleepSession } from '../models/Sleep.js';
import MoodEntry from '../models/MoodEntry.js';
import JournalEntry from '../models/journalEntry.js';
import Assessment from '../models/Assesments.js';
import { generateInsights, analyzeTextSentiment } from '../agents/aiAdapter.js';

/**
 * Analyze user's sleep patterns over a given period
 * @param {string} userId - User ID
 * @param {number} days - Number of days to analyze
 * @returns {Object} Sleep analysis result
 */
export async function analyzeSleepPatterns(userId, days = 14) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const sleepSessions = await SleepSession.find({
            userId: new mongoose.Types.ObjectId(userId),
            startTime: { $gte: startDate }
        }).sort({ startTime: -1 }).lean();

        if (sleepSessions.length === 0) {
            return {
                success: true,
                data: null,
                message: 'No sleep data available for analysis'
            };
        }

        // Calculate metrics
        const durations = sleepSessions
            .filter(s => s.durationMinutes)
            .map(s => s.durationMinutes / 60);

        const qualities = sleepSessions
            .filter(s => s.qualityScore)
            .map(s => s.qualityScore);

        const avgDuration = durations.length > 0
            ? durations.reduce((a, b) => a + b, 0) / durations.length
            : null;

        const avgQuality = qualities.length > 0
            ? qualities.reduce((a, b) => a + b, 0) / qualities.length
            : null;

        // Analyze consistency (check if sleep times are regular)
        const startTimes = sleepSessions.map(s => {
            const d = new Date(s.startTime);
            return d.getHours() * 60 + d.getMinutes(); // Minutes from midnight
        });

        const avgStartTime = startTimes.reduce((a, b) => a + b, 0) / startTimes.length;
        const variance = startTimes.reduce((sum, t) => sum + Math.pow(t - avgStartTime, 2), 0) / startTimes.length;
        const stdDev = Math.sqrt(variance);
        const consistency = stdDev < 60 ? 'high' : stdDev < 120 ? 'moderate' : 'low';

        // Generate quality rating
        let qualityRating = 'fair';
        if (avgDuration >= 7 && avgDuration <= 9 && avgQuality >= 7) {
            qualityRating = 'excellent';
        } else if (avgDuration >= 6 && avgQuality >= 5) {
            qualityRating = 'good';
        } else if (avgDuration < 5 || avgQuality < 4) {
            qualityRating = 'needs attention';
        }

        // Generate suggestions
        const suggestions = [];
        if (avgDuration && avgDuration < 7) {
            suggestions.push('Try to get at least 7 hours of sleep per night');
        }
        if (consistency === 'low') {
            suggestions.push('Establish a more consistent sleep schedule');
        }
        if (avgQuality && avgQuality < 6) {
            suggestions.push('Consider creating a relaxing bedtime routine');
        }

        return {
            success: true,
            data: {
                sessionsAnalyzed: sleepSessions.length,
                averageDuration: avgDuration ? `${avgDuration.toFixed(1)} hours` : null,
                averageQuality: avgQuality ? `${avgQuality.toFixed(1)}/10` : null,
                consistency,
                qualityRating,
                trend: calculateTrend(qualities),
                suggestions,
                latestSession: sleepSessions[0]
            }
        };
    } catch (error) {
        console.error('Sleep analysis error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Analyze user's mood trends
 * @param {string} userId - User ID
 * @param {string} period - 'week', 'month', 'year'
 * @returns {Object} Mood analysis result
 */
export async function analyzeMoodTrends(userId, period = 'week') {
    try {
        const days = period === 'week' ? 7 : period === 'month' ? 30 : 365;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        const moods = await MoodEntry.find({
            userId: new mongoose.Types.ObjectId(userId),
            datetime: { $gte: startDate }
        }).sort({ datetime: -1 }).lean();

        if (moods.length === 0) {
            return {
                success: true,
                data: null,
                message: 'No mood data available for analysis'
            };
        }

        // Calculate average mood
        const moodValues = moods.map(m => m.moodValue);
        const avgMood = moodValues.reduce((a, b) => a + b, 0) / moodValues.length;

        // Count mood labels
        const moodCounts = moods.reduce((acc, m) => {
            acc[m.moodLabel] = (acc[m.moodLabel] || 0) + 1;
            return acc;
        }, {});

        // Find most common mood
        const dominantMood = Object.entries(moodCounts)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

        // Calculate factor correlations
        const factors = {
            sleep: moods.filter(m => m.factors?.sleepQuality).map(m => m.factors.sleepQuality),
            stress: moods.filter(m => m.factors?.stressLevel).map(m => m.factors.stressLevel),
            energy: moods.filter(m => m.factors?.energyLevel).map(m => m.factors.energyLevel),
            social: moods.filter(m => m.factors?.socialInteraction).map(m => m.factors.socialInteraction)
        };

        const avgFactors = {};
        Object.entries(factors).forEach(([key, values]) => {
            if (values.length > 0) {
                avgFactors[key] = (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
            }
        });

        // Generate insights
        let moodCategory = 'balanced';
        if (avgMood >= 7) moodCategory = 'positive';
        else if (avgMood <= 4) moodCategory = 'struggling';

        return {
            success: true,
            data: {
                entriesAnalyzed: moods.length,
                averageMood: avgMood.toFixed(1),
                moodCategory,
                dominantMood,
                moodDistribution: moodCounts,
                factorAverages: avgFactors,
                trend: calculateTrend(moodValues),
                period
            }
        };
    } catch (error) {
        console.error('Mood analysis error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Analyze journal sentiments
 * @param {string} userId - User ID
 * @param {number} limit - Max entries to analyze
 * @returns {Object} Journal analysis result
 */
export async function analyzeJournalSentiments(userId, limit = 20) {
    try {
        const journals = await JournalEntry.find({
            userId: new mongoose.Types.ObjectId(userId)
        }).sort({ date: -1 }).limit(limit).lean();

        if (journals.length === 0) {
            return {
                success: true,
                data: null,
                message: 'No journal entries available for analysis'
            };
        }

        // Aggregate sentiment scores
        const sentiments = journals
            .filter(j => j.sentimentScore !== null && j.sentimentScore !== undefined)
            .map(j => j.sentimentScore);

        const avgSentiment = sentiments.length > 0
            ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length
            : 0;

        // Count tags
        const tagCounts = journals.reduce((acc, j) => {
            (j.tags || []).forEach(tag => {
                acc[tag] = (acc[tag] || 0) + 1;
            });
            return acc;
        }, {});

        // Extract all keywords
        const allKeywords = journals.flatMap(j => j.keywords || []);
        const keywordCounts = allKeywords.reduce((acc, kw) => {
            acc[kw] = (acc[kw] || 0) + 1;
            return acc;
        }, {});
        const topKeywords = Object.entries(keywordCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 10)
            .map(([word]) => word);

        // Calculate mood improvement
        const moodChanges = journals
            .filter(j => j.moodBefore && j.moodAfter)
            .map(j => j.moodAfter - j.moodBefore);
        const avgMoodChange = moodChanges.length > 0
            ? moodChanges.reduce((a, b) => a + b, 0) / moodChanges.length
            : 0;

        return {
            success: true,
            data: {
                entriesAnalyzed: journals.length,
                averageSentiment: avgSentiment.toFixed(2),
                sentimentCategory: avgSentiment > 0.2 ? 'positive' : avgSentiment < -0.2 ? 'negative' : 'neutral',
                topTags: Object.entries(tagCounts).sort((a, b) => b[1] - a[1]).slice(0, 5),
                topKeywords,
                averageMoodImprovement: avgMoodChange.toFixed(2),
                journalingImpact: avgMoodChange > 0.5 ? 'very positive' : avgMoodChange > 0 ? 'positive' : 'neutral'
            }
        };
    } catch (error) {
        console.error('Journal analysis error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Generate comprehensive user insights
 * @param {string} userId - User ID
 * @returns {Object} Comprehensive insights
 */
export async function generateComprehensiveInsights(userId) {
    try {
        // Gather all analyses
        const [sleep, mood, journal] = await Promise.all([
            analyzeSleepPatterns(userId, 14),
            analyzeMoodTrends(userId, 'week'),
            analyzeJournalSentiments(userId, 10)
        ]);

        // Compile data for AI analysis
        const userData = {
            sleep: sleep.data,
            mood: mood.data,
            journal: journal.data
        };

        // Generate AI-powered insights
        const aiInsights = await generateInsights(userData);

        return {
            success: true,
            data: {
                sleepAnalysis: sleep.data,
                moodAnalysis: mood.data,
                journalAnalysis: journal.data,
                aiInsights,
                generatedAt: new Date()
            }
        };
    } catch (error) {
        console.error('Comprehensive insights error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Calculate trend direction from array of values
 */
function calculateTrend(values) {
    if (!values || values.length < 2) return 'stable';

    const firstHalf = values.slice(0, Math.floor(values.length / 2));
    const secondHalf = values.slice(Math.floor(values.length / 2));

    const avgFirst = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const avgSecond = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

    const diff = avgSecond - avgFirst;
    if (diff > 0.5) return 'improving';
    if (diff < -0.5) return 'declining';
    return 'stable';
}

export default {
    analyzeSleepPatterns,
    analyzeMoodTrends,
    analyzeJournalSentiments,
    generateComprehensiveInsights
};
