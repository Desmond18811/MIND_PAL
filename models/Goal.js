import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    category: {
        type: String,
        enum: ['mental-health', 'productivity', 'relationships', 'fitness', 'learning', 'other'],
        default: 'mental-health'
    },
    targetDate: {
        type: Date,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    completed: {
        type: Boolean,
        default: false
    },
    completedAt: Date,
    milestones: [{
        description: String,
        completed: Boolean,
        completedAt: Date
    }],
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium'
    },
    reminderSettings: {
        enabled: Boolean,
        frequency: String, // 'daily', 'weekly', 'monthly'
        nextReminder: Date
    },
    linkedHabits: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Habit'
    }],
    journalReflections: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JournalEntry'
    }],
    isPublic: {
        type: Boolean,
        default: false
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for days remaining
goalSchema.virtual('daysRemaining').get(function() {
    return Math.ceil((this.targetDate - Date.now()) / (1000 * 60 * 60 * 24));
});

// Update progress when milestones are modified
goalSchema.pre('save', function(next) {
    if (this.milestones && this.milestones.length > 0) {
        const completedCount = this.milestones.filter(m => m.completed).length;
        this.progress = Math.round((completedCount / this.milestones.length) * 100);
    }
    next();
});

// Add index for faster queries
goalSchema.index({ userId: 1, targetDate: 1, completed: 1 });

export default mongoose.model('Goal', goalSchema);