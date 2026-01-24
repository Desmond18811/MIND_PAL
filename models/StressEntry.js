import mongoose from 'mongoose';

const stressEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    stressLevel: {
        type: Number,
        min: 1,
        max: 10,
        required: true
    },
    stressors: [{
        name: String,
        intensity: {
            type: Number,
            min: 1,
            max: 5
        },
        category: {
            type: String,
            enum: ['work', 'relationships', 'health', 'financial', 'environmental', 'other']
        }
    }],
    physicalSymptoms: [{
        name: String,
        intensity: Number
    }],
    copingMethods: [{
        name: String,
        effectiveness: Number
    }],
    notes: String,
    location: {
        type: String,
        enum: ['home', 'work', 'outdoors', 'vehicle', 'other']
    },
    timeOfDay: {
        type: String,
        enum: ['morning', 'afternoon', 'evening', 'night']
    },
    durationMinutes: Number,
    triggers: [String],
    moodBefore: Number,
    moodAfter: Number
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Add index for faster queries
stressEntrySchema.index({ userId: 1, date: -1 });
stressEntrySchema.index({ userId: 1, 'stressors.category': 1 });

export default mongoose.model('StressEntry', stressEntrySchema);