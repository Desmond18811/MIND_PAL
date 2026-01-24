
// Import Express and User model
import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get notifications
router.get('/', async (req, res) => {
    // Explanation: Retrieves the user's notifications
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.notifications);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Mark notification as read
router.put('/:id/read', async (req, res) => {
    // Explanation: Marks a specific notification as read
    try {
        const user = await User.findById(req.user.userId);
        const notification = user.notifications.id(req.params.id);
        if (!notification) return res.status(404).json({ error: 'Notification not found' });
        notification.read = true;
        await user.save();
        res.json({ message: 'Notification marked as read' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;