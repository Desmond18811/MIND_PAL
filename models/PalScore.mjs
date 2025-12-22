import mongoose from 'mongoose';

const palScoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    currentScore: {
        type: Number,
        default: 50,
        min: 0,
        max: 100
    },
    history: [{
        date: {
            type: Date,
            default: Date.now
        },
        score: {
            type: Number,
            required: true
        },
        activityType: {
            type: String,
            enum: ['journal', 'meditation', 'goal', 'chat', 'suggestion', 'check-in', 'therapy'],
            required: true
        },
        activityId: mongoose.Schema.Types.ObjectId,
        notes: String,
        impact: {
            type: Number,
            min: 1,
            max: 10
        }
    }],
    trends: {
        weeklyAverage: Number,
        monthlyAverage: Number,
        improvementRate: Number
    }
}, { timestamps: true });

// Update trends before saving
palScoreSchema.pre('save', function (next) {
    if (this.history.length > 0) {
        const now = new Date();
        const oneWeekAgo = new Date(now.setDate(now.getDate() - 7));
        const oneMonthAgo = new Date(now.setMonth(now.getMonth() - 1));

        const weeklyScores = this.history
            .filter(entry => entry.date >= oneWeekAgo)
            .map(entry => entry.score);

        const monthlyScores = this.history
            .filter(entry => entry.date >= oneMonthAgo)
            .map(entry => entry.score);

        this.trends.weeklyAverage = weeklyScores.length > 0 ?
            weeklyScores.reduce((a, b) => a + b, 0) / weeklyScores.length : this.currentScore;

        this.trends.monthlyAverage = monthlyScores.length > 0 ?
            monthlyScores.reduce((a, b) => a + b, 0) / monthlyScores.length : this.currentScore;

        // Simple improvement rate calculation
        if (this.history.length >= 2) {
            const last = this.history[this.history.length - 1].score;
            const prev = this.history[this.history.length - 2].score;
            this.trends.improvementRate = ((last - prev) / prev) * 100;
        }
    }
    next();
});

export default mongoose.model('PalScore', palScoreSchema);