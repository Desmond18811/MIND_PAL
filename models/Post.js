/**
 * Post Model - Community Social Posts ("The Vent")
 */

import mongoose from 'mongoose';

const postSchema = new mongoose.Schema({
    // Author of the post
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },

    // Post content
    content: {
        type: String,
        required: true,
        maxLength: 500 // Short, X-style posts
    },

    // Media attachments (optional)
    mediaUrls: [{
        type: String
    }],

    // Privacy settings
    isAnonymous: {
        type: Boolean,
        default: false
    },

    // Sentiment (auto-analyzed by ML)
    sentiment: {
        score: Number, // -1 to 1
        label: String, // 'positive', 'negative', 'neutral'
        analyzedAt: Date
    },

    // Engagement metrics
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    likeCount: {
        type: Number,
        default: 0
    },
    commentCount: {
        type: Number,
        default: 0
    },

    // Tags/Topics
    tags: [String],

    // Status
    isDeleted: {
        type: Boolean,
        default: false
    },
    flagged: {
        type: Boolean,
        default: false
    }

}, { timestamps: true });

postSchema.index({ createdAt: -1 });
postSchema.index({ tags: 1 });

export default mongoose.model('Post', postSchema);
