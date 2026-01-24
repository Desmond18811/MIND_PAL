/**
 * SerenityAgent - Core AI Agent for MindPal Mental Health App
 * 
 * Serenity is an autonomous AI therapist/companion that:
 * - Conducts empathetic, context-aware conversations (text/voice)
 * - Learns from user interactions over time
 * - Analyzes user data (with permission) for insights
 * - Provides mood scoring and personalized suggestions
 * - Remembers conversation context and user patterns
 */

import mongoose from 'mongoose';
import { generateResponse, analyzeTextSentiment, generateInsights, prepareForVoice, getCurrentProvider } from './aiAdapter.js';
import { SERENITY_SYSTEM_PROMPT, buildUserContext } from './SerenityPrompts.js';
import { gatherUserContext, learnFromSession, addObservation, setUserName, updateUserPatterns } from '../services/userLearningService.js';
import { voiceService } from '../services/voiceService.js';
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
 * Manages AI interactions for a specific user with learning capabilities
 */
class SerenityAgent {
    constructor(userId) {
        if (!userId) {
            throw new Error('SerenityAgent requires a userId');
        }
        this.userId = userId;
        this.userContext = null;
        this.recentResponses = []; // Track to avoid repetition
        this.sessionTopics = [];   // Topics in current session
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
     * Initialize agent with user data, permissions, and learned patterns
     */
    async initialize() {
        try {
            // Load user permissions
            await this.loadPermissions();

            // Gather comprehensive user context using learning service
            this.userContext = await gatherUserContext(this.userId);

            // Update patterns periodically (every 24 hours)
            this.schedulePatternUpdate();

            return true;
        } catch (error) {
            console.error('SerenityAgent initialization error:', error);
            return false;
        }
    }

    /**
     * Schedule pattern updates (called once per day)
     */
    schedulePatternUpdate() {
        // Update patterns on first load, then system cron handles daily updates
        updateUserPatterns(this.userId).catch(err =>
            console.log('Pattern update skipped:', err.message)
        );
    }

    /**
     * Load user's data analysis permissions
     */
    async loadPermissions() {
        try {
            const DataPermission = (await import('../models/DataPermission.js')).default;
            const permission = await DataPermission.findOne({ userId: this.userId });
            if (permission) {
                this.permissions = permission.permissions;
            }
        } catch (error) {
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

            // Refresh context with new permissions
            this.userContext = await gatherUserContext(this.userId);

            return true;
        } catch (error) {
            console.error('Error updating permissions:', error);
            return false;
        }
    }

    /**
     * Handle incoming chat message with context awareness and learning
     * @param {string} message - User's message
     * @param {string} sessionId - Chat session ID
     * @param {string} type - Message type ('text' or 'voice')
     * @param {Object} options - Additional options
     * @returns {Object} Response with text, audio option, and metadata
     */
    async handleMessage(message, sessionId, type = 'text', options = {}) {
        try {
            // Get or create session
            let session = await ChatSession.findById(sessionId);
            if (!session) {
                session = new ChatSession({
                    userId: this.userId,
                    sessionType: type,
                    messages: [],
                    metadata: {
                        topicsDiscussed: []
                    }
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

            // Analyze sentiment and extract info from user message
            const sentiment = await analyzeTextSentiment(message);

            // Extract user name if mentioned
            this.detectAndLearnFromMessage(message);

            // Detect topics and track for session
            const detectedTopics = this.detectTopics(message);
            this.sessionTopics.push(...detectedTopics);

            // Update session metadata
            if (!session.metadata) session.metadata = {};
            session.metadata.topicsDiscussed = [...new Set([
                ...(session.metadata.topicsDiscussed || []),
                ...detectedTopics
            ])].slice(0, 10);

            // Prepare conversation history for AI
            const conversationHistory = session.messages
                .slice(-MAX_CONTEXT_MESSAGES)
                .map(msg => ({
                    role: msg.sender === 'user' ? 'user' : 'assistant',
                    content: msg.content
                }));

            // Build enhanced system prompt with full user context
            const systemPrompt = this.buildEnhancedSystemPrompt();

            // Generate AI response with user context
            const responseText = await generateResponse({
                systemPrompt,
                messages: conversationHistory,
                userContext: this.userContext,
                maxTokens: 350,
                temperature: 0.75
            });

            // Ensure response isn't repetitive
            const finalResponse = this.ensureNonRepetitiveResponse(responseText);

            // Track this response to avoid repetition
            this.trackResponse(finalResponse);

            // Add Serenity's response to session
            const serenityMessage = {
                sender: 'serenity',
                content: finalResponse,
                type: 'text',
                sentiment: sentiment.score,
                timestamp: new Date()
            };
            session.messages.push(serenityMessage);

            // Update session metadata
            session.metadata.lastActivity = new Date();

            await session.save();

            // Learn from this interaction asynchronously
            this.learnFromInteraction(session._id, message, sentiment);

            // Prepare voice response if requested
            let audioResponse = null;
            if (options.generateVoice) {
                const emotion = voiceService.detectEmotionForVoice(finalResponse);
                audioResponse = await voiceService.generateSerenityVoice(finalResponse, { emotion });
            }

            return {
                success: true,
                response: finalResponse,
                sessionId: session._id,
                sentiment,
                timestamp: serenityMessage.timestamp,
                topics: detectedTopics,
                audio: audioResponse,
                provider: getCurrentProvider()
            };

        } catch (error) {
            console.error('Error handling message:', error);
            return {
                success: false,
                response: "I'm having a moment of difficulty right now. Could you try again? I really want to help.",
                error: error.message
            };
        }
    }

    /**
     * Build enhanced system prompt with user context
     */
    buildEnhancedSystemPrompt() {
        let prompt = SERENITY_SYSTEM_PROMPT;

        // Add user context
        if (this.userContext) {
            const contextString = buildUserContext(this.userContext);
            prompt += `\n\n## User Context:\n${contextString}`;
        }

        // Add current session topics for continuity
        if (this.sessionTopics.length > 0) {
            const uniqueTopics = [...new Set(this.sessionTopics)].slice(-5);
            prompt += `\n\n## Current Session Topics: ${uniqueTopics.join(', ')}`;
        }

        // Add conversation style preference
        if (this.userContext?.patterns?.communicationStyle) {
            prompt += `\n\n## Communication Style Preference: ${this.userContext.patterns.communicationStyle}`;
        }

        // Add avoidance of repetition instruction
        if (this.recentResponses.length > 0) {
            prompt += `\n\n## Variation Instruction:\nVary your responses. Avoid repeating phrases like: ${this.recentResponses.slice(-3).join(', ')}`;
        }

        return prompt;
    }

    /**
     * Detect topics from message
     */
    detectTopics(message) {
        const topics = [];
        const lowerMessage = message.toLowerCase();

        const topicPatterns = {
            'stress': /stress|overwhelm|pressure|burden|too much/i,
            'sleep': /sleep|insomnia|tired|exhausted|rest|dream|nightmare/i,
            'work': /work|job|career|boss|colleague|deadline/i,
            'relationships': /relationship|friend|family|partner|parent|sibling/i,
            'anxiety': /anxious|anxiety|worry|nervous|panic|fear/i,
            'depression': /depress|sad|hopeless|empty|meaningless/i,
            'loneliness': /lonely|alone|isolated|nobody|no one/i,
            'self-esteem': /confidence|self-esteem|worth|failure|ugly|stupid/i,
            'health': /health|sick|pain|doctor|medication/i,
            'gratitude': /grateful|thankful|appreciate|blessed/i,
            'exercise': /exercise|workout|gym|running|walk|fitness/i,
            'nutrition': /eating|food|diet|weight|appetite/i
        };

        for (const [topic, pattern] of Object.entries(topicPatterns)) {
            if (pattern.test(lowerMessage)) {
                topics.push(topic);
            }
        }

        return topics;
    }

    /**
     * Detect and learn from user message
     */
    detectAndLearnFromMessage(message) {
        // Detect name introduction
        const nameMatch = message.match(/(?:my name is|i'm|i am|call me)\s+(\w+)/i);
        if (nameMatch && nameMatch[1]) {
            const name = nameMatch[1].charAt(0).toUpperCase() + nameMatch[1].slice(1).toLowerCase();
            if (name.length >= 2 && name.length <= 20) {
                setUserName(this.userId, name).catch(console.error);
                if (!this.userContext) this.userContext = {};
                this.userContext.name = name;
            }
        }

        // Detect stressors mentioned
        const stressors = [];
        if (/work|job|boss/i.test(message)) stressors.push('work-related stress');
        if (/family|parent|sibling/i.test(message)) stressors.push('family dynamics');
        if (/relationship|partner/i.test(message)) stressors.push('relationship concerns');
        if (/money|financial|bills/i.test(message)) stressors.push('financial stress');

        // Add observations about detected stressors
        stressors.forEach(stressor => {
            addObservation(this.userId, `User has mentioned ${stressor}`, 0.7).catch(console.error);
        });
    }

    /**
     * Track responses to avoid repetition
     */
    trackResponse(response) {
        // Extract key phrases
        const keyPhrases = response
            .split(/[.!?]/)
            .filter(s => s.trim().length > 10)
            .slice(0, 2)
            .map(s => s.trim().substring(0, 40));

        this.recentResponses.push(...keyPhrases);

        // Keep only last 10 phrases
        if (this.recentResponses.length > 10) {
            this.recentResponses = this.recentResponses.slice(-10);
        }
    }

    /**
     * Ensure response is not repetitive
     */
    ensureNonRepetitiveResponse(response) {
        // Check if response starts similarly to recent responses
        for (const recent of this.recentResponses.slice(-5)) {
            if (response.toLowerCase().startsWith(recent.toLowerCase().substring(0, 20))) {
                // Add variation to the start
                const variations = [
                    "You know, ",
                    "I hear what you're saying. ",
                    "That's really important. ",
                    "I appreciate you sharing that. ",
                    "Let me reflect on that. "
                ];
                const variation = variations[Math.floor(Math.random() * variations.length)];
                return variation + response;
            }
        }
        return response;
    }

    /**
     * Learn from interaction asynchronously
     */
    async learnFromInteraction(sessionId, message, sentiment) {
        try {
            // Learn from the session
            await learnFromSession(this.userId, sessionId);

            // Add observation if strong sentiment detected
            if (sentiment.score < -0.5) {
                await addObservation(this.userId, 'User showed signs of distress in recent conversation', 0.8);
            } else if (sentiment.score > 0.5) {
                await addObservation(this.userId, 'User expressed positive emotions recently', 0.7);
            }

        } catch (error) {
            console.error('Learning error:', error.message);
        }
    }

    /**
     * Generate a voice response
     * @param {string} text - Text to speak
     * @param {string} emotion - Emotional tone
     * @returns {Object} Voice response with audio
     */
    async generateVoiceResponse(text, emotion = 'empathetic') {
        try {
            return await voiceService.generateSerenityVoice(text, { emotion });
        } catch (error) {
            console.error('Voice generation error:', error);
            return { success: false, error: error.message };
        }
    }

    /**
     * Get conversation history for a session
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
                sessionId: session._id,
                topics: session.metadata?.topicsDiscussed || []
            };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    /**
     * Generate personalized insights from user data
     */
    async generateUserInsights() {
        const hasAnyPermission = Object.values(this.permissions).some(p => p);

        if (!hasAnyPermission) {
            return {
                success: false,
                needsPermission: true,
                message: "I'd love to provide personalized insights! To do that, I need your permission to look at your data. Would you like to grant me access? I'll only use it to help you better."
            };
        }

        try {
            const userData = {};

            if (this.permissions.analyzeMood) {
                const moods = await MoodEntry.find({ userId: this.userId })
                    .sort({ datetime: -1 })
                    .limit(30)
                    .lean();
                userData.moods = moods.map(m => ({
                    value: m.moodValue,
                    label: m.moodLabel,
                    date: m.datetime,
                    factors: m.factors
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

            // Include learned patterns
            if (this.userContext?.patterns) {
                userData.learnedPatterns = this.userContext.patterns;
            }

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
     * Get activity suggestions based on current state and learned patterns
     */
    async suggestActivities(currentMood = 5, timeOfDay = 'afternoon') {
        const suggestions = [];

        // Use learned effective activities if available
        const effectiveActivities = this.userContext?.patterns?.effectiveActivities || [];

        // Prioritize activities that have worked for this user before
        if (effectiveActivities.length > 0 && currentMood <= 5) {
            effectiveActivities.forEach((activity, index) => {
                if (index < 2) {
                    suggestions.push({
                        activity: activity.activity || activity,
                        reason: `This has helped you feel better before`,
                        duration: '10 minutes',
                        priority: index + 1,
                        personalized: true
                    });
                }
            });
        }

        // Low mood suggestions
        if (currentMood <= 4) {
            suggestions.push({
                activity: 'Breathing Exercise',
                reason: 'A quick breathing session can help calm your nervous system',
                duration: '5 minutes',
                priority: suggestions.length + 1
            });
            suggestions.push({
                activity: 'Guided Meditation',
                reason: 'Let Serenity guide you through a soothing meditation',
                duration: '10 minutes',
                priority: suggestions.length + 2
            });
        }

        // Medium mood suggestions
        if (currentMood >= 4 && currentMood <= 6) {
            suggestions.push({
                activity: 'Journal Entry',
                reason: 'Writing down your thoughts can provide clarity and perspective',
                duration: '10 minutes',
                priority: suggestions.length + 1
            });
            suggestions.push({
                activity: 'Music Therapy',
                reason: 'Calming music can help shift your emotional state',
                duration: '15 minutes',
                priority: suggestions.length + 2
            });
        }

        // High mood suggestions
        if (currentMood >= 7) {
            suggestions.push({
                activity: 'Gratitude Journal',
                reason: 'Capture this positive moment to revisit later',
                duration: '5 minutes',
                priority: suggestions.length + 1
            });
            suggestions.push({
                activity: 'Community Share',
                reason: 'Your positive energy could inspire others in the community',
                duration: '5 minutes',
                priority: suggestions.length + 2
            });
        }

        // Time-based suggestions
        if (timeOfDay === 'evening' || timeOfDay === 'night') {
            // Check sleep patterns
            if (this.userContext?.lastSleep?.quality < 6) {
                suggestions.push({
                    activity: 'Sleep Preparation Routine',
                    reason: 'Better sleep habits can improve your overall mood',
                    duration: '15 minutes',
                    priority: 1,
                    personalized: true
                });
            } else {
                suggestions.push({
                    activity: 'Evening Wind-Down',
                    reason: 'A calm evening routine supports restful sleep',
                    duration: '10 minutes',
                    priority: suggestions.length + 1
                });
            }
        }

        if (timeOfDay === 'morning') {
            suggestions.push({
                activity: 'Morning Intention Setting',
                reason: 'Start your day with positive intentions',
                duration: '5 minutes',
                priority: suggestions.length + 1
            });
        }

        return suggestions
            .sort((a, b) => a.priority - b.priority)
            .slice(0, 4);
    }

    /**
     * Request permission to analyze specific data type
     */
    requestPermission(dataType) {
        const messages = {
            analyzeJournals: "I'd love to read your journal entries to better understand your thoughts and feelings. This helps me provide more personalized support. May I have your permission?",
            analyzeVoiceNotes: "Analyzing your voice notes can help me pick up on emotional patterns in how you express yourself. Would you be comfortable with that?",
            analyzeConversations: "Looking at our past conversations helps me remember what matters to you and provide better continuity. Is that okay?",
            analyzeSleepData: "Your sleep patterns tell a lot about your wellbeing. Understanding your sleep can help me offer better suggestions. Can I analyze your sleep data?",
            analyzeAssessments: "Your assessment responses help me understand your mental health journey over time. May I review them?",
            analyzeMood: "Tracking your mood history helps me spot patterns and provide timely support. Can I access this data?"
        };

        return {
            message: messages[dataType] || "May I analyze this data to help you better?",
            dataType,
            requiresConsent: true
        };
    }

    /**
     * Get agent status
     */
    getStatus() {
        return {
            userId: this.userId,
            initialized: !!this.userContext,
            hasPermissions: Object.values(this.permissions).some(p => p),
            provider: getCurrentProvider(),
            recentTopics: [...new Set(this.sessionTopics)].slice(-5),
            userName: this.userContext?.name
        };
    }
}

/**
 * Create a SerenityAgent instance for a user
 */
export async function createSerenityAgent(userId) {
    const agent = new SerenityAgent(userId);
    await agent.initialize();
    return agent;
}

export default SerenityAgent;
