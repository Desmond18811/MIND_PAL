/**
 * SerenityAgent - Core AI Agent for MindPal Mental Health App
 * 
 * Serenity is an autonomous AI therapist/companion that:
 * - Conducts empathetic conversations (text/voice)
 * - Analyzes user data (with permission) for insights
 * - Provides mood scoring and personalized suggestions
 * - Remembers conversation context
 */

import mongoose from 'mongoose';
import { generateResponse, analyzeTextSentiment, generateInsights } from './aiAdapter.js';
import { SERENITY_SYSTEM_PROMPT, buildUserContext } from './SerenityPrompts.js';
import ChatSession from '../models/ChatSession.js';
import JournalEntry from '../models/journalEntry.js';
import { SleepSession } from '../models/Sleep.js';
import MoodEntry from '../models/MoodEntry.js';
import Assessment from '../models/Assesments.js';

/**
 * Maximum messages to keep in context window
 */
const MAX_CONTEXT_MESSAGES = 20;

/**
 * SerenityAgent Class
 * Manages AI interactions for a specific user
 */
class SerenityAgent {
    constructor(userId) {
        if (!userId) {
            throw new Error('SerenityAgent requires a userId');
        }
        this.userId = userId;
        this.userContext = null;
        this.permissions = {
            analyzeJournals: false,
            analyzeVoiceNotes: false,
            analyzeConversations: false,
            analyzeSleepData: false,
            analyzeAssessments: false,
            analyzeMood: false
        };
    }

    /**
     * Initialize agent with user data and permissions
     */
    async initialize() {
        try {
            // Load user permissions
            await this.loadPermissions();

            // Build initial context if permitted
            this.userContext = await this.buildContext();

            return true;
        } catch (error) {
            console.error('SerenityAgent initialization error:', error);
            return false;
        }
    }

    /**
     * Load user's data analysis permissions
     */
    async loadPermissions() {
        try {
            // Import DataPermission model dynamically to avoid circular deps
            const DataPermission = (await import('../models/DataPermission.js')).default;

            const permission = await DataPermission.findOne({ userId: this.userId });
            if (permission) {
                this.permissions = permission.permissions;
            }
        } catch (error) {
            // If model doesn't exist yet, use default (all false)
            console.log('No permissions found, using defaults');
        }
    }

    /**
     * Update user's data analysis permissions
     */
    async updatePermissions(newPermissions) {
        try {
            const DataPermission = (await import('../models/DataPermission.js')).default;

            await DataPermission.findOneAndUpdate(
                { userId: this.userId },
                {
                    userId: this.userId,
                    permissions: { ...this.permissions, ...newPermissions },
                    grantedAt: new Date()
                },
                { upsert: true, new: true }
            );

            this.permissions = { ...this.permissions, ...newPermissions };

            // Rebuild context with new permissions
            this.userContext = await this.buildContext();

            return true;
        } catch (error) {
            console.error('Error updating permissions:', error);
            return false;
        }
    }

    /**
     * Build user context from permitted data sources
     */
    async buildContext() {
        const context = {
            name: null,
            recentMoods: [],
            lastSleep: null,
            recentActivity: null,
            topConcerns: []
        };

        try {
            // Get mood data if permitted
            if (this.permissions.analyzeMood) {
                const recentMoods = await MoodEntry.find({ userId: this.userId })
                    .sort({ datetime: -1 })
                    .limit(7)
                    .lean();

                context.recentMoods = recentMoods.map(m => m.moodValue);
            }

            // Get sleep data if permitted
            if (this.permissions.analyzeSleepData) {
                const lastSleep = await SleepSession.findOne({ userId: this.userId })
                    .sort({ startTime: -1 })
                    .lean();

                if (lastSleep) {
                    context.lastSleep = {
                        duration: lastSleep.durationMinutes ? (lastSleep.durationMinutes / 60).toFixed(1) : null,
                        quality: lastSleep.qualityScore
                    };
                }
            }

            // Get journal themes if permitted
            if (this.permissions.analyzeJournals) {
                const recentJournals = await JournalEntry.find({ userId: this.userId })
                    .sort({ date: -1 })
                    .limit(5)
                    .lean();

                // Extract keywords from journals
                const keywords = recentJournals.flatMap(j => j.keywords || []);
                context.topConcerns = [...new Set(keywords)].slice(0, 5);
            }

        } catch (error) {
            console.error('Error building context:', error);
        }

        return context;
    }

    /**
     * Handle incoming chat message
     * @param {string} message - User's message
     * @param {string} sessionId - Chat session ID
     * @param {string} type - Message type ('text' or 'voice')
     * @returns {Object} Response with text and metadata
     */
    async handleMessage(message, sessionId, type = 'text') {
        try {
            // Get or create session
            let session = await ChatSession.findById(sessionId);
            if (!session) {
                session = new ChatSession({
                    userId: this.userId,
                    sessionType: type,
                    messages: []
                });
            }

            // Add user message to session
            const userMessage = {
                sender: 'user',
                content: message,
                type,
                timestamp: new Date()
            };
            session.messages.push(userMessage);

            // Analyze sentiment of user message
            const sentiment = await analyzeTextSentiment(message);

            // Prepare conversation history for AI
            const conversationHistory = session.messages
                .slice(-MAX_CONTEXT_MESSAGES)
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }));

            // Build system prompt with user context
            const contextString = buildUserContext(this.userContext || {});
            const systemPrompt = `${SERENITY_SYSTEM_PROMPT}\n\n## User Context:\n${contextString}`;

            // Generate AI response
            const responseText = await generateResponse({
                systemPrompt,
                messages: conversationHistory,
                maxTokens: 300,
                temperature: 0.7
            });

            // Add Serenity's response to session
            const serenityMessage = {
                sender: 'serenity',
                content: responseText,
                type: 'text',
                sentiment: sentiment.score,
                timestamp: new Date()
            };
            session.messages.push(serenityMessage);

            // Update session metadata
            if (!session.metadata) {
                session.metadata = {};
            }
            session.metadata.lastActivity = new Date();

            await session.save();

            return {
                success: true,
                response: responseText,
                sessionId: session._id,
                sentiment: sentiment,
                timestamp: serenityMessage.timestamp
            };

        } catch (error) {
            console.error('Error handling message:', error);
            return {
                success: false,
                response: "I'm having trouble processing that right now. Could you try again?",
                error: error.message
            };
        }
    }

    /**
     * Get conversation history for a session
     * @param {string} sessionId - Chat session ID
     * @param {number} limit - Max messages to return
     */
    async getConversationHistory(sessionId, limit = 50) {
        try {
            const session = await ChatSession.findById(sessionId);
            if (!session || session.userId.toString() !== this.userId.toString()) {
                return { success: false, error: 'Session not found or unauthorized' };
            }

            return {
                success: true,
                messages: session.messages.slice(-limit),
                sessionId: session._id
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate personalized insights from user data
     * Requires appropriate permissions
     */
    async generateUserInsights() {
        // Check if any data permissions are granted
        const hasAnyPermission = Object.values(this.permissions).some(p => p);

        if (!hasAnyPermission) {
            return {
                success: false,
                needsPermission: true,
                message: "I'd love to provide personalized insights, but I need your permission to analyze your data first. Would you like to grant me access?"
            };
        }

        try {
            // Aggregate permitted data
            const userData = {};

            if (this.permissions.analyzeMood) {
                const moods = await MoodEntry.find({ userId: this.userId })
                    .sort({ datetime: -1 })
                    .limit(30)
                    .lean();
                userData.moods = moods.map(m => ({
                    value: m.moodValue,
                    label: m.moodLabel,
                    date: m.datetime
                }));
            }

            if (this.permissions.analyzeSleepData) {
                const sleep = await SleepSession.find({ userId: this.userId })
                    .sort({ startTime: -1 })
                    .limit(14)
                    .lean();
                userData.sleep = sleep.map(s => ({
                    duration: s.durationMinutes,
                    quality: s.qualityScore,
                    date: s.startTime
                }));
            }

            if (this.permissions.analyzeJournals) {
                const journals = await JournalEntry.find({ userId: this.userId })
                    .sort({ date: -1 })
                    .limit(10)
                    .select('sentimentScore keywords moodBefore moodAfter tags')
                    .lean();
                userData.journals = journals;
            }

            if (this.permissions.analyzeAssessments) {
                const assessments = await Assessment.find({ userId: this.userId })
                    .sort({ completedAt: -1 })
                    .limit(5)
                    .lean();
                userData.assessments = assessments;
            }

            // Generate insights using AI
            const insights = await generateInsights(userData);

            return {
                success: true,
                insights,
                dataAnalyzed: Object.keys(userData),
                generatedAt: new Date()
            };

        } catch (error) {
            console.error('Error generating insights:', error);
            return {
                success: false,
                error: error.message
            };
        }
    }

    /**
     * Get activity suggestions based on current state
     * @param {number} currentMood - Current mood score (1-10)
     * @param {string} timeOfDay - 'morning', 'afternoon', 'evening', 'night'
     */
    async suggestActivities(currentMood = 5, timeOfDay = 'afternoon') {
        const suggestions = [];

        // Low mood suggestions
        if (currentMood <= 4) {
            suggestions.push({
                activity: 'Breathing Exercise',
                reason: 'A quick breathing session can help calm your mind',
                duration: '5 minutes',
                priority: 1
            });
            suggestions.push({
                activity: 'Guided Meditation',
                reason: 'Let me guide you through a soothing meditation',
                duration: '10 minutes',
                priority: 2
            });
        }

        // Medium mood suggestions
        if (currentMood >= 4 && currentMood <= 6) {
            suggestions.push({
                activity: 'Journal Entry',
                reason: 'Writing down your thoughts can provide clarity',
                duration: '10 minutes',
                priority: 1
            });
            suggestions.push({
                activity: 'Music Therapy',
                reason: 'Some calming music might lift your spirits',
                duration: '15 minutes',
                priority: 2
            });
        }

        // High mood suggestions
        if (currentMood >= 7) {
            suggestions.push({
                activity: 'Gratitude Journal',
                reason: 'Capture this positive moment in writing',
                duration: '5 minutes',
                priority: 1
            });
            suggestions.push({
                activity: 'Community Share',
                reason: 'Your positive energy could help others',
                duration: '5 minutes',
                priority: 3
            });
        }

        // Time-based suggestions
        if (timeOfDay === 'evening' || timeOfDay === 'night') {
            suggestions.push({
                activity: 'Sleep Preparation',
                reason: 'Good sleep habits support mental wellness',
                duration: '10 minutes',
                priority: 2
            });
        }

        return suggestions.sort((a, b) => a.priority - b.priority).slice(0, 3);
    }

    /**
     * Request permission to analyze specific data type
     * @param {string} dataType - Type of data to analyze
     */
    requestPermission(dataType) {
        const messages = {
            journals: "I'd like to read your journal entries to better understand your thoughts and feelings. This helps me provide more personalized support. May I have your permission?",
            voiceNotes: "Analyzing your voice notes can help me pick up on emotional patterns. Would you be comfortable with that?",
            conversations: "Looking at our past conversations helps me remember what matters to you. Is that okay?",
            sleepData: "Your sleep patterns tell a lot about your wellbeing. Can I analyze your sleep data?",
            assessments: "Your assessment responses help me understand your mental health journey. May I review them?",
            mood: "Tracking your mood history helps me spot patterns. Can I access this data?"
        };

        return {
            message: messages[dataType] || "May I analyze this data to help you better?",
            dataType,
            requiresConsent: true
        };
    }
}

/**
 * Create a SerenityAgent instance for a user
 * @param {string} userId - MongoDB user ID
 * @returns {SerenityAgent} Initialized agent
 */
export async function createSerenityAgent(userId) {
    const agent = new SerenityAgent(userId);
    await agent.initialize();
    return agent;
}

export default SerenityAgent;
