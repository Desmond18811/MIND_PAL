import mongoose from 'mongoose';

const meditationContentSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: String,
    duration: { // in seconds
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['guided', 'music', 'nature-sounds', 'body-scan', 'breathing', 'sleep'],
        required: true
    },
    category: {
        type: String,
        enum: ['anxiety', 'stress', 'focus', 'sleep', 'mindfulness', 'beginners', 'advanced'],
        required: true
    },
    instructor: String,
    difficulty: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        default: 'beginner'
    },
    audioUrl: {
        type: String,
        required: true
    },
    imageUrl: String,
    isPremium: {
        type: Boolean,
        default: false
    },
    tags: [String],
    moodTarget: { // Target mood after meditation
        type: String,
        enum: ['calm', 'focused', 'energized', 'relaxed', 'happy']
    },
    plays: {
        type: Number,
        default: 0
    },
    ratings: [{
        userId: mongoose.Schema.Types.ObjectId,
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        review: String
    }],
    averageRating: {
        type: Number,
        min: 0,
        max: 5,
        default: 0
    }
}, { timestamps: true });

// Update average rating when new ratings are added
meditationContentSchema.pre('save', function(next) {
    if (this.ratings && this.ratings.length > 0) {
        this.averageRating = this.ratings.reduce((sum, rating) => sum + rating.rating, 0) / this.ratings.length;
    }
    next();
});

export default mongoose.model('MeditationContent', meditationContentSchema);