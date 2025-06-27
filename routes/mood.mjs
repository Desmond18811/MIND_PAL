
// Import Express and User model
import express from 'express';
import User from '../models/User.mjs';

const router = express.Router();

// Log mood entry
router.post('/log', async (req, res) => {
    // Explanation: Logs a new mood entry for the user
    try {
        const { mood } = req.body;
        const user = await User.findById(req.user.userId);
        user.mood.push({ mood, date: new Date() });
        await user.save();
        res.status(201).json({ message: 'Mood logged' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get mood history
router.get('/history', async (req, res) => {
    // Explanation: Retrieves the user's mood history
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.mood);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update mood entry
router.put('/log/:id', async (req, res) => {
    // Explanation: Updates a specific mood entry
    try {
        const { mood } = req.body;
        const user = await User.findById(req.user.userId);
        const moodEntry = user.mood.id(req.params.id);
        if (!moodEntry) return res.status(404).json({ error: 'Mood entry not found' });
        moodEntry.mood = mood;
        moodEntry.date = new Date();
        await user.save();
        res.json({ message: 'Mood updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;