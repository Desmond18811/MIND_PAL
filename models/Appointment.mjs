import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema({
    // Participants
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    therapistId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Therapist',
        required: true
    },

    // Scheduling
    scheduledAt: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true,
        default: 60  // minutes
    },
    type: {
        type: String,
        enum: ['video', 'audio', 'chat'],
        required: true
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled', 'no-show'],
        default: 'pending'
    },
    cancelledAt: Date,
    cancelledBy: {
        type: String,
        enum: ['user', 'therapist', 'system']
    },
    cancellationReason: String,

    // Session Details
    meetingLink: String,
    meetingId: String,

    // Notes
    notes: {
        preMeeting: {
            type: String,
            maxlength: 1000  // User's notes before session
        },
        postMeeting: {
            type: String,
            maxlength: 2000  // User's reflection after session
        },
        therapistNotes: {
            type: String,
            maxlength: 5000  // Private therapist notes (not visible to user)
        },
        summary: {
            type: String,
            maxlength: 2000  // Therapist's summary for user
        }
    },

    // Feedback (after completion)
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    feedback: {
        type: String,
        maxlength: 1000
    },

    // Wellness tracking
    moodBefore: {
        type: Number,
        min: 1,
        max: 10
    },
    moodAfter: {
        type: Number,
        min: 1,
        max: 10
    },

    // Payment
    payment: {
        amount: Number,
        currency: {
            type: String,
            default: 'USD'
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'refunded', 'failed'],
            default: 'pending'
        },
        transactionId: String,
        paidAt: Date
    },

    // Reminders
    reminders: [{
        type: {
            type: String,
            enum: ['email', 'push', 'sms']
        },
        scheduledFor: Date,
        sentAt: Date
    }]
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.__v;
            // Don't expose therapist notes to regular users
            if (ret.notes) {
                delete ret.notes.therapistNotes;
            }
            return ret;
        }
    }
});

// Indexes
appointmentSchema.index({ userId: 1, scheduledAt: -1 });
appointmentSchema.index({ therapistId: 1, scheduledAt: -1 });
appointmentSchema.index({ status: 1 });
appointmentSchema.index({ scheduledAt: 1 });

// Virtual populates
appointmentSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

appointmentSchema.virtual('therapist', {
    ref: 'Therapist',
    localField: 'therapistId',
    foreignField: '_id',
    justOne: true
});

// Calculate if appointment is upcoming
appointmentSchema.virtual('isUpcoming').get(function () {
    return this.scheduledAt > new Date() &&
        ['pending', 'confirmed'].includes(this.status);
});

// Calculate end time
appointmentSchema.virtual('endTime').get(function () {
    return new Date(this.scheduledAt.getTime() + this.duration * 60 * 1000);
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
