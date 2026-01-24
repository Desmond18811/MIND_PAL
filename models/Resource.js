/**
 * Resource Model - Mindful Content (Articles, Audio, Video)
 */

import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },

    description: {
        type: String,
        maxLength: 1000
    },

    // Type of resource
    type: {
        type: String,
        enum: ['article', 'audio', 'video', 'podcast', 'book'],
        required: true
    },

    // External URL
    url: {
        type: String,
        required: true,
        unique: true // Prevent duplicates
    },

    // Image/Thumbnail
    imageUrl: String,

    // Source information
    source: {
        name: String, // e.g., 'NAMI', 'Mindful.org', 'YouTube'
        scrapedAt: {
            type: Date,
            default: Date.now
        }
    },

    // Content details
    duration: String, // For audio/video (e.g., "10 min")
    author: String,
    publishedAt: Date,

    // Categorization
    tags: [String],
    category: {
        type: String,
        enum: ['anxiety', 'depression', 'sleep', 'mindfulness', 'relationships', 'general'],
        default: 'general'
    },

    // Stats
    views: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },

    isActive: {
        type: Boolean,
        default: true
    }

}, { timestamps: true });

// Text index for searching
resourceSchema.index({ title: 'text', description: 'text', tags: 'text' });
resourceSchema.index({ category: 1, type: 1 });

export default mongoose.model('Resource', resourceSchema);