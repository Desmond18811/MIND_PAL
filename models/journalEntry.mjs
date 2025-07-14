import mongoose from 'mongoose';
import { analyzeContent } from '../utils/contentAnalysis.mjs';

const journalEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },

    title: String,
    content: {
        type: String,
        required: true
    },
    moodBefore: {
        type: Number,
        min: 1,
        max: 5,
        required: true
    },
    moodAfter: {
        type: Number,
        min: 1,
        max: 5
    },
    tags: [{
        type: String,
        enum: ['reflection', 'gratitude', 'stress', 'anxiety', 'happiness', 'goal', 'dream']
    }],
    wordCount: Number,
    readingTime: Number,
    isVoiceEntry: {
        type: Boolean,
        default: false
    },
    audioRef: String, // Reference to audio file in storage
    transcriptionConfidence: Number, // If using voice
    sentimentScore: {
        type: Number,
        min: -1,
        max: 1
    },
    keywords: [String],
    musicPlayed: {
        trackId: String,
        name: String,
        artist: String,
        duration: Number,
        mood: String
    },
    images: [String],
    isPrivate: {
        type: Boolean,
        default: true
    },
    analysis: {
        emotionalTone: String,
        cognitivePatterns: [String],
        stressMarkers: [String]
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Add text analysis before saving
journalEntrySchema.pre('save', async function(next) {
    if (this.isModified('content')) {
        this.wordCount = this.content.split(/\s+/).length;
        this.readingTime = Math.ceil(this.wordCount / 200);

        // Only analyze if content changed
        if (this.content.length > 10) {
            const { sentimentScore, keywords } = await analyzeContent(this.content);
            this.sentimentScore = sentimentScore;
            this.keywords = keywords;
        }
    }
    next();
});

// Virtual for mood improvement
journalEntrySchema.virtual('moodImprovement').get(function() {
    return this.moodAfter - this.moodBefore;
});

export default mongoose.model('JournalEntry', journalEntrySchema);