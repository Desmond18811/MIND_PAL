import Goal from '../models/Goal.mjs';
import mongoose from 'mongoose';
import {updateScore} from './palScoreController.mjs'

// Create a new goal
export const createGoal = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { title, description, category, targetDate, milestones, difficulty } = req.body;
        const userId = req.user._id;

        const goal = await Goal.create([{
            userId,
            title,
            description,
            category,
            targetDate: new Date(targetDate),
            milestones: milestones || [],
            difficulty
        }], { session });

        await updateScore(userId, {
            type: 'goal-set',
            _id: goal[0]._id,
            difficulty,
            category
        });

        await session.commitTransaction();
        session.endSession();

        res.status(201).json(goal[0]);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

// Get all goals for a user
export const getGoals = async (req, res) => {
    try {
        const { status, category, sortBy = 'targetDate', sortOrder = 'asc' } = req.query;
        const userId = req.user._id;

        let query = { userId };

        if (status === 'active') {
            query.completed = false;
            query.targetDate = { $gte: new Date() };
        } else if (status === 'completed') {
            query.completed = true;
        } else if (status === 'overdue') {
            query.completed = false;
            query.targetDate = { $lt: new Date() };
        }

        if (category) {
            query.category = category;
        }

        const sortOptions = {};
        sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

        const goals = await Goal.find(query)
            .sort(sortOptions)
            .populate('linkedHabits', 'title streak')
            .populate('journalReflections', 'title createdAt');

        res.json(goals);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update a goal
export const updateGoal = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const userId = req.user._id;
        const updateData = req.body;

        if (updateData.targetDate) {
            updateData.targetDate = new Date(updateData.targetDate);
        }

        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId },
            updateData,
            { new: true, session }
        );

        if (!goal) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({ error: 'Goal not found' });
        }

        // Update Pal score if completing the goal
        if (updateData.completed && !goal.completed) {
            await updateScore(userId, {
                type: 'goal-completed',
                _id: goal._id,
                difficulty: goal.difficulty,
                category: goal.category
            });
        }

        await session.commitTransaction();
        session.endSession();

        res.json(goal);
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(400).json({ error: error.message });
    }
};

// Delete a goal
export const deleteGoal = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const goal = await Goal.findOneAndDelete({ _id: id, userId });

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Add a milestone to a goal
export const addMilestone = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;
        const { description } = req.body;

        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId },
            { $push: { milestones: { description } } },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ error: 'Goal not found' });
        }

        res.json(goal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Complete a milestone
export const completeMilestone = async (req, res) => {
    try {
        const { id, milestoneId } = req.params;
        const userId = req.user._id;

        const goal = await Goal.findOneAndUpdate(
            { _id: id, userId, 'milestones._id': milestoneId },
            {
                $set: {
                    'milestones.$.completed': true,
                    'milestones.$.completedAt': new Date()
                }
            },
            { new: true }
        );

        if (!goal) {
            return res.status(404).json({ error: 'Goal or milestone not found' });
        }

        res.json(goal);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get goal statistics
export const getGoalStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await Goal.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    totalGoals: { $sum: 1 },
                    completedGoals: {
                        $sum: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                    },
                    activeGoals: {
                        $sum: {
                            $cond: [
                                { $and: [
                                        { $eq: ['$completed', false] },
                                        { $gte: ['$targetDate', new Date()] }
                                    ]},
                                1,
                                0
                            ]
                        }
                    },
                    overdueGoals: {
                        $sum: {
                            $cond: [
                                { $and: [
                                        { $eq: ['$completed', false] },
                                        { $lt: ['$targetDate', new Date()] }
                                    ]},
                                1,
                                0
                            ]
                        }
                    },
                    avgProgress: { $avg: '$progress' },
                    byCategory: {
                        $push: {
                            category: '$category',
                            count: 1,
                            completed: { $cond: [{ $eq: ['$completed', true] }, 1, 0] }
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    totalGoals: 1,
                    completedGoals: 1,
                    activeGoals: 1,
                    overdueGoals: 1,
                    completionRate: {
                        $cond: [
                            { $eq: ['$totalGoals', 0] },
                            0,
                            { $divide: ['$completedGoals', '$totalGoals'] }
                        ]
                    },
                    avgProgress: 1,
                    categories: {
                        $reduce: {
                            input: '$byCategory',
                            initialValue: [],
                            in: {
                                $let: {
                                    vars: {
                                        existing: {
                                            $filter: {
                                                input: '$$value',
                                                as: 'cat',
                                                cond: { $eq: ['$$cat.category', '$$this.category'] }
                                            }
                                        }
                                    },
                                    in: {
                                        $cond: [
                                            { $gt: [{ $size: '$$existing' }, 0] },
                                            {
                                                $map: {
                                                    input: '$$value',
                                                    as: 'cat',
                                                    in: {
                                                        $cond: [
                                                            { $eq: ['$$cat.category', '$$this.category'] },
                                                            {
                                                                category: '$$cat.category',
                                                                count: { $add: ['$$cat.count', 1] },
                                                                completed: { $add: ['$$cat.completed', '$$this.completed'] }
                                                            },
                                                            '$$cat'
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $concatArrays: [
                                                    '$$value',
                                                    [{
                                                        category: '$$this.category',
                                                        count: 1,
                                                        completed: '$$this.completed'
                                                    }]
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    }
                }
            }
        ]);

        res.json(stats[0] || {
            totalGoals: 0,
            completedGoals: 0,
            activeGoals: 0,
            overdueGoals: 0,
            completionRate: 0,
            avgProgress: 0,
            categories: []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};