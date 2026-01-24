import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    title: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['system', 'reminder', 'alert', 'achievement', 'recommendation'],
        default: 'system'
    },
    category: {
        type: String,
        enum: ['journal', 'therapy', 'stress', 'sleep', 'meditation', 'goal', 'general'],
        default: 'general'
    },
    priority: {
        type: Number,
        min: 1,
        max: 3,
        default: 2
    },
    read: {
        type: Boolean,
        default: false
    },
    actionRequired: Boolean,
    actionUrl: String,
    metadata: mongoose.Schema.Types.Mixed,
    scheduledAt: Date,
    expiresAt: Date
}, {
    timestamps: true,
    toJSON: { virtuals: true }
});

// Indexes for faster queries
notificationSchema.index({ userId: 1, read: 1 });
notificationSchema.index({ userId: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, expiresAt: 1 });

export default mongoose.model('Notification', notificationSchema);