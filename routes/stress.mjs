// Import Express and User model
import express from 'express';
import User from '../models/User.mjs';

const router = express.Router();

// Get stress level
router.get('/level', async (req, res) => {
    // Explanation: Retrieves the user's current stress level
    try {
        const user = await User.findById(req.user.userId);
        res.json({ level: user.stress.level });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update stress level
router.put('/level', async (req, res) => {
    // Explanation: Updates the user's stress level and adds to history
    try {
        const { level } = req.body;
        const user = await User.findById(req.user.userId);
        user.stress.level = level;
        user.stress.history.push({ level, date: new Date() });
        await user.save();
        res.json({ message: 'Stress level updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get suggested activities
router.get('/activities', async (req, res) => {
    // Explanation: Returns stress-relief activities based on stress level (placeholder)
    try {
        const user = await User.findById(req.user.userId);
        const level = user.stress.level || 50;
        const activities = level > 50
            ? ['Take a 5-minute walk', 'Practice deep breathing']
            : ['Read a book', 'Listen to calming music'];
        res.json({ activities });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;