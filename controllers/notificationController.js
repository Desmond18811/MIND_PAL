import Notification from '../models/Notification.js';
import mongoose from 'mongoose';

// Create a new notification
export const createNotification = async (req, res) => {
    try {
        const { title, message, type, category, priority, actionRequired, actionUrl, metadata, scheduledAt, expiresAt } = req.body;
        const userId = req.user._id;

        const notification = await Notification.create({
            userId,
            title,
            message,
            type,
            category,
            priority,
            actionRequired,
            actionUrl,
            metadata,
            scheduledAt,
            expiresAt
        });

        // Real-time notification logic would go here
        // (e.g., WebSocket emit to client)

        res.status(201).json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get user notifications
export const getNotifications = async (req, res) => {
    try {
        const { read, type, category, limit = 20 } = req.query;
        const userId = req.user._id;

        const query = { userId };
        if (read !== undefined) query.read = read === 'true';
        if (type) query.type = type;
        if (category) query.category = category;

        const notifications = await Notification.find(query)
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .lean();

        res.json(notifications);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Mark notification as read
export const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndUpdate(
            { _id: id, userId },
            { read: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json(notification);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete notification
export const deleteNotification = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const notification = await Notification.findOneAndDelete(
            { _id: id, userId }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get notification statistics
export const getNotificationStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const stats = await Notification.aggregate([
            { $match: { userId: mongoose.Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    read: { $sum: { $cond: [{ $eq: ['$read', true] }, 1, 0] } },
                    unread: { $sum: { $cond: [{ $eq: ['$read', false] }, 1, 0] } },
                    byType: { $push: { type: '$type', count: 1 } },
                    byCategory: { $push: { category: '$category', count: 1 } }
                }
            },
            {
                $project: {
                    _id: 0,
                    total: 1,
                    read: 1,
                    unread: 1,
                    types: {
                        $reduce: {
                            input: '$byType',
                            initialValue: [],
                            in: {
                                $let: {
                                    vars: {
                                        existing: {
                                            $filter: {
                                                input: '$$value',
                                                as: 't',
                                                cond: { $eq: ['$$t.type', '$$this.type'] }
                                            }
                                        }
                                    },
                                    in: {
                                        $cond: [
                                            { $gt: [{ $size: '$$existing' }, 0] },
                                            {
                                                $map: {
                                                    input: '$$value',
                                                    as: 't',
                                                    in: {
                                                        $cond: [
                                                            { $eq: ['$$t.type', '$$this.type'] },
                                                            { type: '$$t.type', count: { $add: ['$$t.count', 1] } },
                                                            '$$t'
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $concatArrays: [
                                                    '$$value',
                                                    [{ type: '$$this.type', count: 1 }]
                                                ]
                                            }
                                        ]
                                    }
                                }
                            }
                        }
                    },
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
                                                as: 'c',
                                                cond: { $eq: ['$$c.category', '$$this.category'] }
                                            }
                                        }
                                    },
                                    in: {
                                        $cond: [
                                            { $gt: [{ $size: '$$existing' }, 0] },
                                            {
                                                $map: {
                                                    input: '$$value',
                                                    as: 'c',
                                                    in: {
                                                        $cond: [
                                                            { $eq: ['$$c.category', '$$this.category'] },
                                                            { category: '$$c.category', count: { $add: ['$$c.count', 1] } },
                                                            '$$c'
                                                        ]
                                                    }
                                                }
                                            },
                                            {
                                                $concatArrays: [
                                                    '$$value',
                                                    [{ category: '$$this.category', count: 1 }]
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
            total: 0,
            read: 0,
            unread: 0,
            types: [],
            categories: []
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};