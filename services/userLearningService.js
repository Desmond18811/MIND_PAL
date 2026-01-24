/**
 * User Learning Service - Memory and Pattern Learning for Serenity
 * Tracks user patterns, learns from interactions, and provides personalized context
 */

import mongoose from 'mongoose';
import MoodEntry from '../models/MoodEntry.js';
import JournalEntry from '../models/journalEntry.js';
import { SleepSession } from '../models/Sleep.js';
import ChatSession from '../models/ChatSession.js';
import Assessment from '../models/Assesments.js';

/**
 * UserMemory Schema - Stores learned patterns about users
 */
const userMemorySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // User profile information
    profile: {
        name: String,
        preferredName: String,
        timezone: String,
        communicationStyle: {
            type: String,
            enum: ['supportive', 'direct', 'gentle', 'motivational'],
            default: 'supportive'
        }
    },

    // Learned patterns from user behavior
    patterns: {
        // Time-based patterns
        activeHours: [Number], // Hours when user is most active
        moodPatternsByTime: {
            morning: { avgMood: Number, count: Number },
            afternoon: { avgMood: Number, count: Number },
            evening: { avgMood: Number, count: Number },
            night: { avgMood: Number, count: Number }
        },

        // Sleep patterns
        sleepTrend: {
            type: String,
            enum: ['improving', 'stable', 'declining', 'unknown'],
            default: 'unknown'
        },
        avgSleepDuration: Number,
        avgSleepQuality: Number,

        // Trigger patterns
        knownTriggers: [String],
        knownReliefs: [String],

        // Activity effectiveness
        effectiveActivities: [{
            activity: String,
            moodImprovement: Number,
            useCount: Number
        }]
    },

    // Topics frequently discussed
    frequentTopics: [{
        topic: String,
        count: Number,
        sentiment: Number,
        lastMentioned: Date
    }],

    // Conversation insights
    conversationInsights: {
        totalSessions: { type: Number, default: 0 },
        avgSessionLength: { type: Number, default: 0 },
        preferredResponseLength: {
            type: String,
            enum: ['brief', 'moderate', 'detailed'],
            default: 'moderate'
        },
        engagementScore: { type: Number, default: 0 }
    },

    // Long-term observations
    observations: [{
        insight: String,
        confidence: Number,
        createdAt: { type: Date, default: Date.now }
    }],

    // User preferences learned over time
    preferences: {
        prefersMorningCheckIns: Boolean,
        prefersVoiceInteraction: Boolean,
        respondsWellTo: [String],
        avoidsTopics: [String]
    },

    // Last update timestamps
    lastPatternUpdate: Date,
    lastConversation: Date

}, { timestamps: true });

const UserMemory = mongoose.model('UserMemory', userMemorySchema);

/**
 * Get or create user memory
 */
export async function getOrCreateMemory(userId) {
    let memory = await UserMemory.findOne({ userId });
    if (!memory) {
        memory = new UserMemory({ userId });
        await memory.save();
    }
    return memory;
}

/**
 * Main function to gather comprehensive user context for Serenity
 * Aggregates data from multiple sources for personalized responses
 */
export async function gatherUserContext(userId) {
    const context = {
        name: null,
        recentMoods: [],
        lastSleep: null,
        stressLevel: null,
        recentJournalThemes: [],
        topConcerns: [],
        lastActivity: null,
        learningInsights: [],
        conversationHistory: [],
        patterns: {}
    };

    try {
        // Get user memory
        const memory = await getOrCreateMemory(userId);

        if (memory.profile?.preferredName) {
            context.name = memory.profile.preferredName;
        }

        // Get recent mood entries (last 7 days)
        const recentMoods = await MoodEntry.find({
            userId,
            datetime: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        }).sort({ datetime: -1 }).limit(10).lean();

        if (recentMoods.length > 0) {
            context.recentMoods = recentMoods.map(m => m.moodValue);

            // Get stress level from most recent mood
            if (recentMoods[0]?.factors?.stressLevel) {
                context.stressLevel = recentMoods[0].factors.stressLevel;
            }
        }

        // Get last sleep session
        const lastSleep = await SleepSession.findOne({ userId })
            .sort({ startTime: -1 }).lean();

        if (lastSleep) {
            context.lastSleep = {
                duration: lastSleep.durationMinutes ? (lastSleep.durationMinutes / 60).toFixed(1) : null,
                quality: lastSleep.qualityScore
            };
        }

        // Get recent journal themes
        const recentJournals = await JournalEntry.find({ userId })
            .sort({ date: -1 }).limit(5).lean();

        if (recentJournals.length > 0) {
            const allKeywords = recentJournals.flatMap(j => j.keywords || []);
            context.recentJournalThemes = [...new Set(allKeywords)].slice(0, 5);

            // Extract tags as concerns
            const allTags = recentJournals.flatMap(j => j.tags || []);
            context.topConcerns = [...new Set(allTags)].slice(0, 5);
        }

        // Get last activity from various sources
        const lastSession = await ChatSession.findOne({ userId })
            .sort({ updatedAt: -1 }).lean();

        if (lastSession) {
            const lastMsgTime = lastSession.updatedAt || lastSession.createdAt;
            const hoursAgo = Math.round((Date.now() - new Date(lastMsgTime)) / (1000 * 60 * 60));
            context.lastActivity = hoursAgo < 24 ? `Chat ${hoursAgo} hours ago` : `Chat ${Math.round(hoursAgo / 24)} days ago`;
        }

        // Add learned insights from memory
        if (memory.observations && memory.observations.length > 0) {
            context.learningInsights = memory.observations
                .filter(o => o.confidence > 0.6)
                .slice(-3)
                .map(o => o.insight);
        }

        // Add frequent topics
        if (memory.frequentTopics && memory.frequentTopics.length > 0) {
            const topTopics = memory.frequentTopics
                .sort((a, b) => b.count - a.count)
                .slice(0, 5)
                .map(t => t.topic);
            context.topConcerns = [...new Set([...context.topConcerns, ...topTopics])].slice(0, 7);
        }

        // Add pattern information
        context.patterns = {
            sleepTrend: memory.patterns?.sleepTrend,
            effectiveActivities: memory.patterns?.effectiveActivities?.slice(0, 3).map(a => a.activity),
            knownTriggers: memory.patterns?.knownTriggers?.slice(0, 3),
            communicationStyle: memory.profile?.communicationStyle
        };

        // Get last few messages for conversation continuity
        if (lastSession && lastSession.messages) {
            context.conversationHistory = lastSession.messages
                .slice(-6)
                .map(m => ({
                    sender: m.sender,
                    content: m.content.substring(0, 200),
                    timestamp: m.timestamp
                }));
        }

    } catch (error) {
        console.error('Error gathering user context:', error);
    }

    return context;
}

/**
 * Learn from a conversation session
 * Analyzes the session and updates user memory
 */
export async function learnFromSession(userId, sessionId) {
    try {
        const session = await ChatSession.findById(sessionId);
        if (!session) return;

        const memory = await getOrCreateMemory(userId);

        // Extract topics from conversation
        const userMessages = session.messages
            .filter(m => m.sender === 'user')
            .map(m => m.content);

        if (userMessages.length > 0) {
            const topics = extractTopics(userMessages);

            // Update frequent topics
            topics.forEach(topic => {
                const existing = memory.frequentTopics.find(t => t.topic === topic.toLowerCase());
                if (existing) {
                    existing.count++;
                    existing.lastMentioned = new Date();
                } else {
                    memory.frequentTopics.push({
                        topic: topic.toLowerCase(),
                        count: 1,
                        sentiment: 0,
                        lastMentioned: new Date()
                    });
                }
            });

            // Keep only top 20 topics
            memory.frequentTopics = memory.frequentTopics
                .sort((a, b) => b.count - a.count)
                .slice(0, 20);
        }

        // Update conversation insights
        memory.conversationInsights.totalSessions++;
        const sessionMsgCount = session.messages.length;
        memory.conversationInsights.avgSessionLength =
            (memory.conversationInsights.avgSessionLength * (memory.conversationInsights.totalSessions - 1) + sessionMsgCount) /
            memory.conversationInsights.totalSessions;

        // Detect preferred response length
        const userMsgLengths = userMessages.map(m => m.length);
        const avgUserMsgLength = userMsgLengths.reduce((a, b) => a + b, 0) / userMsgLengths.length;
        if (avgUserMsgLength < 50) {
            memory.conversationInsights.preferredResponseLength = 'brief';
        } else if (avgUserMsgLength > 150) {
            memory.conversationInsights.preferredResponseLength = 'detailed';
        }

        memory.lastConversation = new Date();
        await memory.save();

    } catch (error) {
        console.error('Error learning from session:', error);
    }
}

/**
 * Extract topics from message array
 */
function extractTopics(messages) {
    const topics = [];
    const topicPatterns = {
        'stress': /stress|anxious|anxiety|overwhelm|pressure/gi,
        'sleep': /sleep|insomnia|tired|exhausted|rest/gi,
        'work': /work|job|career|boss|colleague|office/gi,
        'relationship': /relationship|partner|boyfriend|girlfriend|spouse|marriage|family/gi,
        'health': /health|sick|pain|doctor|medical/gi,
        'loneliness': /lonely|alone|isolated|nobody|friend/gi,
        'sadness': /sad|depressed|depression|unhappy|crying/gi,
        'anger': /angry|frustrated|annoyed|irritated|mad/gi,
        'happiness': /happy|excited|grateful|joy|wonderful/gi,
        'self-esteem': /confidence|self-esteem|worth|failure|ugly/gi,
        'exercise': /exercise|workout|gym|running|fitness/gi,
        'eating': /eating|food|appetite|diet|weight/gi
    };

    const combinedText = messages.join(' ').toLowerCase();

    Object.entries(topicPatterns).forEach(([topic, pattern]) => {
        if (pattern.test(combinedText)) {
            topics.push(topic);
        }
    });

    return topics;
}

/**
 * Update user patterns from their data
 * Run periodically to keep patterns up to date
 */
export async function updateUserPatterns(userId) {
    try {
        const memory = await getOrCreateMemory(userId);
        const now = new Date();
        const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

        // Analyze mood patterns by time of day
        const moods = await MoodEntry.find({
            userId,
            datetime: { $gte: thirtyDaysAgo }
        }).lean();

        if (moods.length > 0) {
            const byTime = { morning: [], afternoon: [], evening: [], night: [] };

            moods.forEach(mood => {
                const hour = new Date(mood.datetime).getHours();
                if (hour >= 5 && hour < 12) byTime.morning.push(mood.moodValue);
                else if (hour >= 12 && hour < 17) byTime.afternoon.push(mood.moodValue);
                else if (hour >= 17 && hour < 21) byTime.evening.push(mood.moodValue);
                else byTime.night.push(mood.moodValue);
            });

            Object.entries(byTime).forEach(([period, values]) => {
                if (values.length > 0) {
                    memory.patterns.moodPatternsByTime[period] = {
                        avgMood: values.reduce((a, b) => a + b, 0) / values.length,
                        count: values.length
                    };
                }
            });
        }

        // Analyze sleep patterns
        const sleepSessions = await SleepSession.find({
            userId,
            startTime: { $gte: thirtyDaysAgo }
        }).lean();

        if (sleepSessions.length >= 3) {
            const durations = sleepSessions.map(s => s.durationMinutes / 60);
            const qualities = sleepSessions.filter(s => s.qualityScore).map(s => s.qualityScore);

            memory.patterns.avgSleepDuration = durations.reduce((a, b) => a + b, 0) / durations.length;
            if (qualities.length > 0) {
                memory.patterns.avgSleepQuality = qualities.reduce((a, b) => a + b, 0) / qualities.length;
            }

            // Determine sleep trend
            if (sleepSessions.length >= 7) {
                const firstHalf = sleepSessions.slice(Math.floor(sleepSessions.length / 2));
                const secondHalf = sleepSessions.slice(0, Math.floor(sleepSessions.length / 2));

                const avgFirst = firstHalf.reduce((sum, s) => sum + (s.qualityScore || 5), 0) / firstHalf.length;
                const avgSecond = secondHalf.reduce((sum, s) => sum + (s.qualityScore || 5), 0) / secondHalf.length;

                if (avgSecond - avgFirst > 0.5) memory.patterns.sleepTrend = 'improving';
                else if (avgFirst - avgSecond > 0.5) memory.patterns.sleepTrend = 'declining';
                else memory.patterns.sleepTrend = 'stable';
            }
        }

        // Detect active hours
        const sessions = await ChatSession.find({
            userId,
            createdAt: { $gte: thirtyDaysAgo }
        }).lean();

        if (sessions.length > 0) {
            const hourCounts = new Array(24).fill(0);
            sessions.forEach(s => {
                const hour = new Date(s.createdAt).getHours();
                hourCounts[hour]++;
            });

            // Find top 3 active hours
            memory.patterns.activeHours = hourCounts
                .map((count, hour) => ({ hour, count }))
                .sort((a, b) => b.count - a.count)
                .slice(0, 3)
                .map(h => h.hour);
        }

        memory.lastPatternUpdate = new Date();
        await memory.save();

        return memory.patterns;

    } catch (error) {
        console.error('Error updating user patterns:', error);
        return null;
    }
}

/**
 * Add an observation about the user
 */
export async function addObservation(userId, insight, confidence = 0.7) {
    try {
        const memory = await getOrCreateMemory(userId);

        // Avoid duplicate observations
        const exists = memory.observations.some(o =>
            o.insight.toLowerCase() === insight.toLowerCase()
        );

        if (!exists) {
            memory.observations.push({
                insight,
                confidence,
                createdAt: new Date()
            });

            // Keep only last 20 observations
            if (memory.observations.length > 20) {
                memory.observations = memory.observations.slice(-20);
            }

            await memory.save();
        }

        return true;
    } catch (error) {
        console.error('Error adding observation:', error);
        return false;
    }
}

/**
 * Update user's preferred name
 */
export async function setUserName(userId, name) {
    try {
        const memory = await getOrCreateMemory(userId);
        if (!memory.profile) memory.profile = {};
        memory.profile.preferredName = name;
        await memory.save();
        return true;
    } catch (error) {
        console.error('Error setting user name:', error);
        return false;
    }
}

/**
 * Get conversation summary for continuity
 */
export async function getConversationSummary(userId, sessionId) {
    try {
        const session = await ChatSession.findById(sessionId);
        if (!session) return null;

        const messageCount = session.messages.length;
        const topics = [];

        // Extract key topics from recent messages
        const recentUserMessages = session.messages
            .filter(m => m.sender === 'user')
            .slice(-5)
            .map(m => m.content);

        if (recentUserMessages.length > 0) {
            const extractedTopics = extractTopics(recentUserMessages);
            topics.push(...extractedTopics);
        }

        return {
            messageCount,
            topics: [...new Set(topics)],
            lastMessageTime: session.messages[session.messages.length - 1]?.timestamp,
            sessionStart: session.createdAt
        };
    } catch (error) {
        console.error('Error getting conversation summary:', error);
        return null;
    }
}

export default {
    getOrCreateMemory,
    gatherUserContext,
    learnFromSession,
    updateUserPatterns,
    addObservation,
    setUserName,
    getConversationSummary,
    UserMemory
};
