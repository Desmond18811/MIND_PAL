import mongoose from 'mongoose';

const therapistSchema = new mongoose.Schema({
    // Link to User model for authentication
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },

    // Verification & License
    licenseNumber: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedAt: Date,

    // Professional Information
    professionalInfo: {
        title: {
            type: String,
            enum: ['Dr.', 'Licensed Therapist', 'Clinical Psychologist', 'Counselor', 'Psychiatrist', 'Other'],
            default: 'Licensed Therapist'
        },
        specializations: [{
            type: String,
            enum: [
                'anxiety', 'depression', 'PTSD', 'trauma', 'grief',
                'relationship', 'family', 'addiction', 'eating-disorders',
                'OCD', 'bipolar', 'stress', 'anger-management', 'self-esteem',
                'life-transitions', 'career', 'LGBTQ+', 'child-adolescent', 'other'
            ]
        }],
        yearsOfExperience: {
            type: Number,
            min: 0
        },
        education: [{
            degree: String,
            institution: String,
            year: Number
        }],
        certifications: [{
            name: String,
            issuedBy: String,
            year: Number,
            expiresAt: Date
        }]
    },

    // Profile
    bio: {
        type: String,
        maxlength: 2000
    },
    profilePicture: String,
    languages: [{
        type: String,
        default: 'English'
    }],

    // Availability & Booking
    availability: {
        schedule: [{
            dayOfWeek: {
                type: Number,  // 0-6 (Sunday-Saturday)
                min: 0,
                max: 6
            },
            startTime: String,  // HH:MM format
            endTime: String     // HH:MM format
        }],
        sessionDuration: {
            type: Number,
            default: 60,  // minutes
            enum: [30, 45, 60, 90]
        },
        sessionTypes: [{
            type: String,
            enum: ['video', 'audio', 'chat']
        }],
        timezone: {
            type: String,
            default: 'UTC'
        }
    },

    // Pricing
    pricing: {
        hourlyRate: {
            type: Number,
            min: 0
        },
        currency: {
            type: String,
            default: 'USD'
        },
        acceptsInsurance: {
            type: Boolean,
            default: false
        },
        insuranceProviders: [String]
    },

    // Ratings & Stats
    rating: {
        average: {
            type: Number,
            default: 0,
            min: 0,
            max: 5
        },
        count: {
            type: Number,
            default: 0
        }
    },
    completedSessions: {
        type: Number,
        default: 0
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'active', 'suspended', 'inactive'],
        default: 'pending'
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.__v;
            return ret;
        }
    }
});

// Indexes for search functionality
therapistSchema.index({ 'professionalInfo.specializations': 1 });
therapistSchema.index({ languages: 1 });
therapistSchema.index({ status: 1 });
therapistSchema.index({ 'rating.average': -1 });
therapistSchema.index({
    bio: 'text',
    'professionalInfo.specializations': 'text'
});

// Virtual for full name from linked User
therapistSchema.virtual('user', {
    ref: 'User',
    localField: 'userId',
    foreignField: '_id',
    justOne: true
});

const Therapist = mongoose.model('Therapist', therapistSchema);

export default Therapist;
