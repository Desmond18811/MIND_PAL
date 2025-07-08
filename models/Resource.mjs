import mongoose from 'mongoose';

const resourceSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    source: {
        type: String,
        required: true,
        enum: ['newsapi', 'contextualweb', 'jstor', 'healthyplace', 'cdc', 'nami', 'custom']
    },
    url: {
        type: String,
        required: true,
        validate: {
            validator: v => /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/.test(v),
            message: props => `${props.value} is not a valid URL!`
        }
    },
    content: String,
    summary: String,
    categories: [{
        type: String,
        enum: ['anxiety', 'depression', 'stress', 'mindfulness', 'sleep', 'relationships', 'trauma', 'productivity']
    }],
    type: {
        type: String,
        enum: ['article', 'video', 'podcast', 'research', 'tool', 'exercise'],
        default: 'article'
    },
    readingTime: Number, // in minutes
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'intermediate'
    },
    publishedAt: Date,
    lastFetched: {
        type: Date,
        default: Date.now
    },
    metadata: mongoose.Schema.Types.Mixed,
    userRatings: [{
        userId: mongoose.Schema.Types.ObjectId,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        feedback: String
    }],
    averageRating: Number,
    isVerified: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Calculate average rating before saving
resourceSchema.pre('save', function(next) {
    if (this.userRatings && this.userRatings.length > 0) {
        const sum = this.userRatings.reduce((total, rating) => total + rating.rating, 0);
        this.averageRating = sum / this.userRatings.length;
    }
    next();
});

// Text index for search
resourceSchema.index({ title: 'text', content: 'text', summary: 'text' });

export default mongoose.model('Resource', resourceSchema);