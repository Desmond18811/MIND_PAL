/**
 * Machine Learning Service
 * Advanced algorithms for behavioral pattern recognition and prediction
 */

import mongoose from 'mongoose';
import _ from 'lodash';
import { SleepSession } from '../models/Sleep.js';
import MoodEntry from '../models/MoodEntry.js';
import ChatSession from '../models/ChatSession.js';

/**
 * Infer sleep patterns from user activity data (when manual logs are missing)
 * Uses a simplified clustering approach to find "silence windows"
 * @param {string} userId - User ID
 * @param {number} days - Days of history to analyze
 * @returns {Object} Inferred sleep pattern
 */
export async function inferSleepPatterns(userId, days = 30) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);

        // 1. Gather all activity timestamps
        const [chats, moods, sleeps] = await Promise.all([
            ChatSession.find({ userId, createdAt: { $gte: startDate } }).select('createdAt messages.timestamp').lean(),
            MoodEntry.find({ userId, datetime: { $gte: startDate } }).select('datetime').lean(),
            SleepSession.find({ userId, startTime: { $gte: startDate } }).lean()
        ]);

        // Flatten timestamps
        let timestamps = [];
        chats.forEach(c => {
            timestamps.push(new Date(c.createdAt).getTime());
            if (c.messages) c.messages.forEach(m => timestamps.push(new Date(m.timestamp).getTime()));
        });
        moods.forEach(m => timestamps.push(new Date(m.datetime).getTime()));
        timestamps.sort((a, b) => a - b);

        if (timestamps.length < 50) {
            return { confidence: 0, message: "Insufficient activity data" };
        }

        // 2. Identify "Silence Windows" (>4 hours of inactivity)
        const silenceWindows = [];
        for (let i = 1; i < timestamps.length; i++) {
            const diff = timestamps[i] - timestamps[i - 1];
            const hoursDiff = diff / (1000 * 60 * 60);

            // Assume sleep if inactivity is between 4 and 14 hours
            if (hoursDiff >= 4 && hoursDiff <= 14) {
                // Check if this falls roughly during night hours (e.g., starts between 8PM and 4AM)
                const startDate = new Date(timestamps[i - 1]);
                const hour = startDate.getHours();

                if (hour >= 20 || hour <= 4) {
                    silenceWindows.push({
                        start: timestamps[i - 1],
                        end: timestamps[i],
                        duration: hoursDiff
                    });
                }
            }
        }

        if (silenceWindows.length < 5) {
            return { confidence: 0.1, message: "Irregular activity patterns" };
        }

        // 3. Calculate Average Sleep Window
        // Convert start times to "minutes from previous midnight" to handle cross-day math
        const startMinutes = silenceWindows.map(w => {
            const d = new Date(w.start);
            let mins = d.getHours() * 60 + d.getMinutes();
            // If starts after midnight (e.g. 1AM), add 24h worth of minutes to cluster properly?
            // Actually easier: if hour < 12, add 1440 (24h). So 1AM (60) becomes 1500, 11PM (1380) stays 1380
            if (d.getHours() < 12) mins += 1440;
            return mins;
        });

        const avgStartMin = startMinutes.reduce((a, b) => a + b, 0) / startMinutes.length;
        const avgDuration = silenceWindows.reduce((a, b) => a + b.duration, 0) / silenceWindows.length;

        // Convert back to readable time
        let predictedBedtimeHour = Math.floor(avgStartMin / 60);
        const predictedBedtimeMin = Math.round(avgStartMin % 60);
        if (predictedBedtimeHour >= 24) predictedBedtimeHour -= 24;

        // 4. Calculate Reliability (Consistency)
        // Variance of start times
        const variance = startMinutes.reduce((sum, m) => sum + Math.pow(m - avgStartMin, 2), 0) / startMinutes.length;
        const stdDev = Math.sqrt(variance); // in minutes

        // Low stdDev = High consistency
        let reliability = Math.max(0, 100 - (stdDev / 3)); // Heuristic: 300min (5h) var = 0 score
        reliability = Math.min(100, Math.round(reliability));

        return {
            success: true,
            confidence: reliability / 100,
            inferred: {
                avgBedtime: `${String(predictedBedtimeHour).padStart(2, '0')}:${String(predictedBedtimeMin).padStart(2, '0')}`,
                avgDurationHours: avgDuration.toFixed(1),
                consistencyScore: reliability,
                dataPoints: silenceWindows.length
            },
            analysis: reliability > 80 ? "Highly Consistent" : reliability > 50 ? "Moderate Variation" : "Irregular"
        };

    } catch (error) {
        console.error('ML Sleep Inference Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Predict Mood Trajectory using Weighted Linear Regression
 * Gives more weight to recent days
 * @param {string} userId - User ID
 * @returns {Object} Mood prediction
 */
export async function predictMoodTrend(userId) {
    try {
        // Get last 14 days of mood
        const start = new Date();
        start.setDate(start.getDate() - 14);

        const moods = await MoodEntry.find({ userId, datetime: { $gte: start } })
            .sort({ datetime: 1 }) // Oldest first
            .select('moodValue datetime')
            .lean();

        if (moods.length < 5) {
            return { canPredict: false, message: "Need more mood data points (min 5)" };
        }

        // Prepare data points (x = day offset, y = mood)
        // Weight recent days higher
        let xSum = 0, ySum = 0, xySum = 0, x2Sum = 0, weightSum = 0;
        const firstDay = new Date(moods[0].datetime).getTime();

        moods.forEach((m, index) => {
            const dayOffset = (new Date(m.datetime).getTime() - firstDay) / (1000 * 60 * 60 * 24);
            const mood = m.moodValue;

            // Exponential weight based on recency (index)
            // Last item gets weight 1.0, first gets smaller
            const weight = Math.pow(1.1, index);

            xSum += dayOffset * weight;
            ySum += mood * weight;
            xySum += dayOffset * mood * weight;
            x2Sum += dayOffset * dayOffset * weight;
            weightSum += weight;
        });

        // Weighted Linear Regression: y = mx + c
        // m = (W*sum(wxy) - sum(wx)*sum(wy)) / (W*sum(wx^2) - sum(wx)^2)
        const m = (weightSum * xySum - xSum * ySum) / (weightSum * x2Sum - xSum * xSum);
        const c = (ySum - m * xSum) / weightSum;

        // Predict next 3 days
        const lastDayOffset = (new Date(moods[moods.length - 1].datetime).getTime() - firstDay) / (1000 * 60 * 60 * 24);

        // Clamp predictions to 1-10
        const prediction1 = Math.min(10, Math.max(1, m * (lastDayOffset + 1) + c));
        const prediction3 = Math.min(10, Math.max(1, m * (lastDayOffset + 3) + c));

        let trend = "stable";
        if (m > 0.1) trend = "improving";
        if (m < -0.1) trend = "declining";
        if (m < -0.3) trend = "rapidly declining";

        return {
            canPredict: true,
            currentTrend: trend,
            slope: m.toFixed(3),
            predictions: {
                tomorrow: prediction1.toFixed(1),
                in3Days: prediction3.toFixed(1)
            },
            warning: trend.includes("declining") && prediction1 < 4
        };

    } catch (error) {
        console.error('ML Mood Prediction Error:', error);
        return { success: false, error: error.message };
    }
}

/**
 * Correlate Activities/Topics with Mood
 * Identifies what improves or worsens user's mood
 * @param {string} userId - User ID
 * @returns {Object} Correlations
 */
export async function correlateActivityWithMood(userId) {
    try {
        // Get aggregated user data
        // Use dynamic import to avoid circular dependency if userLearningService imports this service later
        const { getOrCreateMemory } = await import('./userLearningService.js');
        const memory = await getOrCreateMemory(userId);

        if (!memory || !memory.frequentTopics) return { success: false };

        // This is a simplified correlation. 
        // In a full system, we'd spatially join journal topic timestamps with subsequent mood entries.
        // Here we leverage the 'sentiment' stored in topics and check if high-sentiment topics appear often.

        const correlations = [];

        // Analyze topics
        memory.frequentTopics.forEach(topic => {
            // If we have explicit mood impact data (future feature), use that
            // For now, use the average sentiment accumulated
            if (topic.count > 2) {
                if (topic.sentiment > 0.2) {
                    correlations.push({
                        factor: topic.topic,
                        impact: "positive",
                        strength: "moderate",
                        advice: `Discussing ${topic.topic} seems to lift your spirits.`
                    });
                } else if (topic.sentiment < -0.2) {
                    correlations.push({
                        factor: topic.topic,
                        impact: "negative",
                        strength: "moderate",
                        advice: `${topic.topic} appears to be a stressor for you.`
                    });
                }
            }
        });

        return {
            success: true,
            correlations: correlations.sort((a, b) => a.impact === 'positive' ? -1 : 1).slice(0, 5)
        };

    } catch (error) {
        console.error('ML Correlation Error:', error);
        return { success: false, error: error.message };
    }
}

export default {
    inferSleepPatterns,
    predictMoodTrend,
    correlateActivityWithMood
};
