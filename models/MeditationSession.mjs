import mongoose from 'mongoose';

const meditationSessionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeditationContent'
    },
    startTime: {
        type: Date,
        default: Date.now
    },
    endTime: Date,
    duration: Number, // in seconds
    moodBefore: {
        type: Number,
        min: 1,
        max: 5
    },
    moodAfter: {
        type: Number,
        min: 1,
        max: 5
    },
    heartRateBefore: Number,
    heartRateAfter: Number,
    notes: String,
    isCompleted: {
        type: Boolean,
        default: false
    },
    deviceInfo: {
        os: String,
        model: String
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    }
}, { timestamps: true });

// Calculate duration before saving
meditationSessionSchema.pre('save', function(next) {
    if (this.endTime && this.startTime) {
        this.duration = (this.endTime - this.startTime) / 1000; // Convert to seconds
    }
    next();
});

// Add geospatial index for location-based analytics
meditationSessionSchema.index({ location: '2dsphere' });

export default mongoose.model('MeditationSession', meditationSessionSchema);