import mongoose from 'mongoose';

const moodEntrySchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    datetime: {
        type: Date,
        default: Date.now,
        index: true
    },
    moodValue: {
        type: Number,
        required: true,
        min: 1,
        max: 10,
        description: '1-10 scale where 10 is best mood'
    },
    moodLabel: {
        type: String,
        enum: [
            'depressed',
            'sad',
            'neutral',
            'content',
            'happy',
            'excited',
            'anxious',
            'angry',
            'stressed'
        ],
        required: true
    },
    factors: {
        sleepQuality: {
            type: Number,
            min: 1,
            max: 5
        },
        stressLevel: {
            type: Number,
            min: 1,
            max: 5
        },
        energyLevel: {
            type: Number,
            min: 1,
            max: 5
        },
        socialInteraction: {
            type: Number,
            min: 1,
            max: 5,
            description: '1 = isolated, 5 = highly social'
        }
    },
    activities: [{
        type: String,
        enum: [
            'meditation',
            'exercise',
            'work',
            'social',
            'creative',
            'rest',
            'journaling',
            'music',
            'nature'
        ]
    }],
    notes: {
        type: String,
        maxlength: 500
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number], // [longitude, latitude]
            default: [0, 0]
        }
    },
    weather: {
        temperature: Number,
        conditions: {
            type: String,
            enum: [
                'sunny',
                'cloudy',
                'rainy',
                'snowy',
                'windy',
                'stormy'
            ]
        }
    },
    associatedMeditation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeditationSession'
    },
    associatedJournal: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'JournalEntry'
    },
    isManualEntry: {
        type: Boolean,
        default: true
    },
    deviceInfo: {
        os: String,
        appVersion: String
    }
}, {
    timestamps: true,
    toJSON: {
        virtuals: true,
        transform: function(doc, ret) {
            delete ret._id;
            delete ret.__v;
            return ret;
        }
    }
});

// Add geospatial index for location-based mood analysis
moodEntrySchema.index({ location: '2dsphere' });

// Compound index for frequent queries
moodEntrySchema.index({ userId: 1, datetime: -1 });

// Virtual for mood category (positive/neutral/negative)
moodEntrySchema.virtual('moodCategory').get(function() {
    if (this.moodValue >= 7) return 'positive';
    if (this.moodValue >= 4) return 'neutral';
    return 'negative';
});

// Pre-save hook to ensure consistent data
moodEntrySchema.pre('save', function(next) {
    // Auto-calculate moodLabel if not provided
    if (!this.moodLabel) {
        if (this.moodValue <= 3) this.moodLabel = 'sad';
        else if (this.moodValue <= 5) this.moodLabel = 'neutral';
        else if (this.moodValue <= 7) this.moodLabel = 'content';
        else this.moodLabel = 'happy';
    }

    // Set default location to user's home location if available
    if (this.isModified('location') && this.location.coordinates[0] === 0) {
        // This would need to be populated from user profile
        // this.location = user.homeLocation;
    }

    next();
});

// Static method for mood trends analysis
moodEntrySchema.statics.analyzeTrends = async function(userId, period = 'week') {
    const dateFilter = getDateFilter(period);

    const results = await this.aggregate([
        { $match: { userId: mongoose.Types.ObjectId(userId), datetime: dateFilter } },
        {
            $group: {
                _id: null,
                averageMood: { $avg: "$moodValue" },
                moodFrequency: {
                    $push: {
                        label: "$moodLabel",
                        value: "$moodValue"
                    }
                },
                commonActivities: { $push: "$activities" },
                commonFactors: {
                    sleep: { $avg: "$factors.sleepQuality" },
                    stress: { $avg: "$factors.stressLevel" },
                    energy: { $avg: "$factors.energyLevel" },
                    social: { $avg: "$factors.socialInteraction" }
                }
            }
        },
        {
            $project: {
                averageMood: 1,
                moodDistribution: {
                    $reduce: {
                        input: "$moodFrequency",
                        initialValue: {},
                        in: {
                            $mergeObjects: [
                                "$$value",
                                {
                                    $arrayToObject: [
                                        [
                                            [
                                                "$$this.label",
                                                { $add: [
                                                        { $ifNull: [ "$$value.$$this.label", 0 ] },
                                                        1
                                                    ] }
                                            ]
                                        ]
                                    ]
                                }
                            ]
                        }
                    }
                },
                topActivities: {
                    $reduce: {
                        input: "$commonActivities",
                        initialValue: [],
                        in: { $concatArrays: [ "$$value", "$$this" ] }
                    }
                },
                factorAverages: "$commonFactors"
            }
        },
        {
            $project: {
                averageMood: 1,
                moodDistribution: 1,
                topActivities: {
                    $slice: [
                        {
                            $reduce: {
                                input: "$topActivities",
                                initialValue: { counts: {}, order: [] },
                                in: {
                                    counts: {
                                        $mergeObjects: [
                                            "$$value.counts",
                                            {
                                                $arrayToObject: [
                                                    [
                                                        [
                                                            "$$this",
                                                            { $add: [
                                                                    { $ifNull: [ "$$value.counts.$$this", 0 ] },
                                                                    1
                                                                ] }
                                                        ]
                                                    ]
                                                ]
                                            }
                                        ]
                                    },
                                    order: {
                                        $cond: [
                                            { $in: [ "$$this", "$$value.order" ] },
                                            "$$value.order",
                                            { $concatArrays: [ "$$value.order", [ "$$this" ] ] }
                                        ]
                                    }
                                }
                            }
                        },
                        5
                    ]
                },
                factorAverages: 1
            }
        }
    ]);

    return results[0] || {
        averageMood: null,
        moodDistribution: {},
        topActivities: [],
        factorAverages: {}
    };
};

// Helper function for date filtering
function getDateFilter(period) {
    const now = new Date();
    const filter = {};

    switch (period) {
        case 'day':
            filter.$gte = new Date(now.setHours(0, 0, 0, 0));
            break;
        case 'week':
            filter.$gte = new Date(now.setDate(now.getDate() - 7));
            break;
        case 'month':
            filter.$gte = new Date(now.setMonth(now.getMonth() - 1));
            break;
        case 'year':
            filter.$gte = new Date(now.setFullYear(now.getFullYear() - 1));
            break;
    }

    return filter;
}

export default mongoose.model('MoodEntry', moodEntrySchema);