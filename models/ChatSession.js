/**
 * ChatSession Model - Enhanced for Serenity AI conversations
 */

import mongoose from 'mongoose';

// Define the ChatSession schema
const chatSessionSchema = new mongoose.Schema({
    // User associated with the session
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Session type
    sessionType: {
        type: String,
        enum: ['text', 'voice', 'mixed'],
        default: 'text'
    },

    // Session metadata for analytics
    metadata: {
        moodAtStart: {
            type: Number,
            min: 1,
            max: 10
        },
        moodAtEnd: {
            type: Number,
            min: 1,
            max: 10
        },
        topicsDiscussed: [String],
        insightsProvided: [String],
        lastActivity: Date,
        duration: Number // in minutes
    },

    // User consent for this session's data analysis
    analysisConsent: {
        type: Boolean,
        default: false
    },

    // Messages in the session
    messages: [{
        // Sender of the message ('user' or 'serenity')
        sender: {
            type: String,
            required: true,
            enum: ['user', 'serenity', 'bot', 'system']
        },
        // Content of the message
        content: {
            type: String,
            required: true
        },
        // Message type
        type: {
            type: String,
            enum: ['text', 'voice', 'system'],
            default: 'text'
        },
        // Audio URL for voice messages
        audioUrl: String,
        // Sentiment score of the message (-1 to 1)
        sentiment: {
            type: Number,
            min: -1,
            max: 1
        },
        // Timestamp of the message
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],

    // Session summary (AI-generated)
    summary: {
        text: String,
        generatedAt: Date
    },

    // Whether session is active
    isActive: {
        type: Boolean,
        default: true
    },

    // When session was ended
    endedAt: Date

}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Index for efficient queries
chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ userId: 1, isActive: 1 });

// Virtual for message count
chatSessionSchema.virtual('messageCount').get(function () {
    return this.messages?.length || 0;
});

// Virtual for session duration in minutes
chatSessionSchema.virtual('durationMinutes').get(function () {
    if (this.messages.length < 2) return 0;
    const first = this.messages[0].timestamp;
    const last = this.messages[this.messages.length - 1].timestamp;
    return Math.round((last - first) / 60000);
});

// Method to add a message
chatSessionSchema.methods.addMessage = function (sender, content, type = 'text', options = {}) {
    this.messages.push({
        sender,
        content,
        type,
        audioUrl: options.audioUrl,
        sentiment: options.sentiment,
        timestamp: new Date()
    });

    if (this.metadata) {
        this.metadata.lastActivity = new Date();
    }

    return this;
};

// Method to end session
chatSessionSchema.methods.endSession = function (moodAtEnd) {
    this.isActive = false;
    this.endedAt = new Date();

    if (moodAtEnd && this.metadata) {
        this.metadata.moodAtEnd = moodAtEnd;
    }

    // Calculate duration
    if (this.messages.length >= 2 && this.metadata) {
        this.metadata.duration = this.durationMinutes;
    }

    return this;
};

// Static to find recent sessions for a user
chatSessionSchema.statics.findRecent = function (userId, limit = 10) {
    return this.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select('_id sessionType createdAt metadata isActive messageCount');
};

// Create and export the ChatSession model
export default mongoose.model('ChatSession', chatSessionSchema);
