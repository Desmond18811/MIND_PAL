import StressEntry from '../models/StressEntry.mjs';
import mongoose from 'mongoose';
import { updateScore } from './palScoreController.mjs';

// Record a new stress entry
export const createStressEntry = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const {
            stressLevel,
            stressors,
            physicalSymptoms,
            copingMethods,
            notes,
            location,
            timeOfDay,
            durationMinutes,
            triggers,
            moodBefore,
            moodAfter
        } = req.body;

        const userId = req.user._id;

        const entry = await StressEntry.create([{
            userId,
            stressLevel,
            stressors,
            physicalSymptoms,
            copingMethods,
            notes,
            location,
            timeOfDay,
            durationMinutes,
            triggers,
            moodBefore,
            moodAfter
        }], { session });

        // Update Pal score based on stress management
        await updateScore(userId, {
            type: 'stress-tracked',
            _id: entry[0]._id,
            stressLevel,
            usedCopingMethods: copingMethods.length > 0
        });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(entry[0]);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

// Get stress entries with filters
export const getStressEntries = async (req, res) => {
    try {
        const {
            startDate,
            endDate,
            minLevel,
            maxLevel,
            category,
            limit = 30
        } = req.query;

        const userId = req.user._id;
        const query = { userId };

        // Date range filter
        if (startDate || endDate) {
            query.date = {};
            if (startDate) query.date.$gte = new Date(startDate);
            if (endDate) query.date.$lte = new Date(endDate);
        }

        // Stress level filter
        if (minLevel || maxLevel) {
            query.stressLevel = {};
            if (minLevel) query.stressLevel.$gte = parseInt(minLevel);
            if (maxLevel) query.stressLevel.$lte = parseInt(maxLevel);
        }

        // Stressor category filter
        if (category) {
            query['stressors.category'] = category;
        }

        const entries = await StressEntry.find(query)
            .sort({ date: -1 })
            .limit(parseInt(limit));

        res.json(entries);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get stress statistics and analytics
export const getStressStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const { period = 'month' } = req.query;

        const dateRange = getDateRange(period);
        const matchStage = {
            userId: mongoose.Types.ObjectId(userId),
            date: { $gte: dateRange.start, $lte: dateRange.end }
        };

        const stats = await StressEntry.aggregate([
            { $match: matchStage },
            {
                $facet: {
                    // Basic statistics
                    overview: [
                        {
                            $group: {
                                _id: null,
                                totalEntries: { $sum: 1 },
                                averageStress: { $avg: '$stressLevel' },
                                maxStress: { $max: '$stressLevel' },
                                minStress: { $min: '$stressLevel' },
                                entriesWithCopingMethods: {
                                    $sum: {
                                        $cond: [{ $gt: [{ $size: '$copingMethods' }, 0] }, 1, 0]
                                    }
                                }
                            }
                        }
                    ],
                    // Stress level distribution
                    levelDistribution: [
                        { $group: { _id: '$stressLevel', count: { $sum: 1 } } },
                        { $sort: { _id: 1 } }
                    ],
                    // Top stressors
                    topStressors: [
                        { $unwind: '$stressors' },
                        {
                            $group: {
                                _id: '$stressors.name',
                                count: { $sum: 1 },
                                avgIntensity: { $avg: '$stressors.intensity' }
                            }
                        },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ],
                    // Effective coping methods
                    effectiveCopingMethods: [
                        { $unwind: '$copingMethods' },
                        {
                            $match: {
                                'copingMethods.effectiveness': { $gte: 3 }
                            }
                        },
                        {
                            $group: {
                                _id: '$copingMethods.name',
                                count: { $sum: 1 },
                                avgEffectiveness: { $avg: '$copingMethods.effectiveness' }
                            }
                        },
                        { $sort: { avgEffectiveness: -1 } },
                        { $limit: 5 }
                    ],
                    // Time patterns
                    timePatterns: [
                        {
                            $group: {
                                _id: '$timeOfDay',
                                count: { $sum: 1 },
                                avgStress: { $avg: '$stressLevel' }
                            }
                        }
                    ],
                    // Location patterns
                    locationPatterns: [
                        {
                            $group: {
                                _id: '$location',
                                count: { $sum: 1 },
                                avgStress: { $avg: '$stressLevel' }
                            }
                        }
                    ]
                }
            },
            {
                $project: {
                    overview: { $arrayElemAt: ['$overview', 0] },
                    levelDistribution: 1,
                    topStressors: 1,
                    effectiveCopingMethods: 1,
                    timePatterns: 1,
                    locationPatterns: 1
                }
            }
        ]);

        res.json(stats[0] || {
            overview: {
                totalEntries: 0,
                averageStress: 0,
                maxStress: 0,
                minStress: 0,
                entriesWithCopingMethods: 0
            },
            levelDistribution: [],
            topStressors: [],
            effectiveCopingMethods: [],
            timePatterns: [],
            locationPatterns: []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Helper function to get date ranges
function getDateRange(period) {
    const now = new Date();
    const start = new Date(now);

    switch (period) {
        case 'week':
            start.setDate(now.getDate() - 7);
            break;
        case 'month':
            start.setMonth(now.getMonth() - 1);
            break;
        case 'year':
            start.setFullYear(now.getFullYear() - 1);
            break;
        default: // month
            start.setMonth(now.getMonth() - 1);
    }

    return { start, end: now };
}