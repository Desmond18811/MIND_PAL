import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    personalInfo: {
        firstName: String,
        lastName: String,
        dateOfBirth: Date,
        gender: {
            type: String,
            enum: ['male', 'female', 'other', 'prefer-not-to-say']
        },
        profilePicture: String
    },
    contactInfo: {
        email: String,
        phone: String,
        address: {
            street: String,
            city: String,
            state: String,
            country: String,
            zipCode: String
        }
    },
    preferences: {
        theme: {
            type: String,
            enum: ['light', 'dark', 'system'],
            default: 'system'
        },
        notificationPreferences: {
            email: Boolean,
            push: Boolean,
            sms: Boolean
        },
        language: {
            type: String,
            default: 'en'
        }
    },
    healthInfo: {
        height: Number, // in cm
        weight: Number, // in kg
        bloodType: {
            type: String,
            enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', null]
        },
        allergies: [String],
        medications: [String],
        conditions: [String]
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: (doc, ret) => {
            delete ret.__v;
            delete ret._id;
            return ret;
        }
    }
});

// Update the updatedAt field on save
profileSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

// Create a text index for search functionality
profileSchema.index({
    'personalInfo.firstName': 'text',
    'personalInfo.lastName': 'text',
    'contactInfo.email': 'text',
    'contactInfo.phone': 'text'
});

const Profile = mongoose.model('Profile', profileSchema);

export default Profile;