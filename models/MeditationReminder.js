import mongoose from 'mongoose';

const meditationReminderSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true // One reminder setting per user
    },
    hour: {
        type: Number,
        min: 0,
        max: 23,
        required: true
    },
    minute: {
        type: Number,
        min: 0,
        max: 59,
        default: 0
    },
    days: [{
        type: Number,
        min: 0, // 0 = Sunday, 1 = Monday, etc.
        max: 6
    }],
    customMessage: String,
    isActive: {
        type: Boolean,
        default: true
    },
    lastSent: Date,
    notificationMethod: {
        type: String,
        enum: ['push', 'email', 'both'],
        default: 'push'
    },
    timezone: {
        type: String,
        default: 'UTC'
    }
}, { timestamps: true });

// Index for faster querying
meditationReminderSchema.index({
    isActive: 1,
    hour: 1,
    minute: 1
});

// Virtual property for next reminder time
meditationReminderSchema.virtual('nextReminderTime').get(function() {
    const now = new Date();
    const reminderTime = new Date(now);

    reminderTime.setHours(this.hour, this.minute, 0, 0);

    // If time already passed today, set for next day
    if (reminderTime <= now) {
        reminderTime.setDate(reminderTime.getDate() + 1);
    }

    return reminderTime;
});

export default mongoose.model('MeditationReminder', meditationReminderSchema);