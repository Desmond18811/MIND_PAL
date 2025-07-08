import mongoose from 'mongoose';

const errorLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: false // Some errors might occur before auth
    },
    code: {
        type: String,
        required: true
    },
    message: {
        type: String,
        required: true
    },
    path: String,
    method: String,
    stack: String,
    ipAddress: String,
    userAgent: String,
    metadata: mongoose.Schema.Types.Mixed,
    resolved: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Indexes for error tracking
errorLogSchema.index({ code: 1, createdAt: -1 });
errorLogSchema.index({ resolved: 1 });

export default mongoose.model('ErrorLog', errorLogSchema);