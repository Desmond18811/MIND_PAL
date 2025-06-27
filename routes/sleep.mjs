
// Import Express and User model
import express from 'express';
import User from '../models/User.mjs';

const router = express.Router();

// Get sleep quality data
router.get('/quality', async (req, res) => {
    // Explanation: Retrieves the user's current sleep quality
    try {
        const user = await User.findById(req.user.userId);
        res.json({ quality: user.sleep.quality });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update sleep quality data
router.put('/quality', async (req, res) => {
    // Explanation: Updates the user's sleep quality and adds to history
    try {
        const { quality } = req.body;
        const user = await User.findById(req.user.userId);
        user.sleep.quality = quality;
        user.sleep.history.push({ quality, date: new Date() });
        await user.save();
        res.json({ message: 'Sleep quality updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get sleep schedule
router.get('/schedule', async (req, res) => {
    // Explanation: Retrieves the user's sleep schedule
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.sleep.schedule);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update sleep schedule
router.put('/schedule', async (req, res) => {
    // Explanation: Updates the user's sleep schedule
    try {
        const { bedtime, wakeTime } = req.body;
        const user = await User.findById(req.user.userId);
        user.sleep.schedule = { bedtime, wakeTime };
        await user.save();
        res.json({ message: 'Sleep schedule updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router; 

