import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    username: {
        type: String,
        required: true
    },
    twoFactorSecret: {
        type: String
    }, // For 2FA
    resetPasswordToken: {
        type: String
    },
    resetPasswordExpires: {
        type: Date
    },
    onboardingCompleted: {
        type: Boolean,
        default: false
    },
    assessmentCompletedAt: Date,
    lastAssessmentUpdate: Date,
    healthGoals: [String],
    preferences: {
        notificationFrequency: {
            type: String,
            enum: ['daily', 'weekly', 'monthly', 'none'],
            default: 'weekly'
        },
        preferredActivities: [String]
    },
    profile: {
        displayName: String,
        language: String,
        devices: [String]
    },
    mentalHealthScore: {
        current: Number,
        history: [{ score: Number, date: Date }]
    },
    sleep: {
        quality: Number,
        schedule: { bedtime: String, wakeTime: String },
        history: [{ quality: Number, date: Date }]
    },
    mood: [{ mood: String, date: Date }],
    stress: {
        level: Number,
        history: [{ level: Number, date: Date }]
    },
    journal: [{ content: String, date: Date }],
    notifications: [{ message: String, read: Boolean, date: Date }]
},);

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (this.isModified('password')) {
        this.password = await bcrypt.hash(this.password, 10);
    }
    next();
},
{ timestamps: true }
);

export default mongoose.model('User', userSchema);