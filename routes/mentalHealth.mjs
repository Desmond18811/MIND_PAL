import express from 'express';
import User from '../models/User.mjs';

const router = express.Router();

// Get mental health score
router.get('/score', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json({ score: user.mentalHealthScore.current });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update mental health score
router.put('/score', async (req, res) => {
    try {
        const { score } = req.body;
        const user = await User.findById(req.user.userId);
        user.mentalHealthScore.current = score;
        user.mentalHealthScore.history.push({ score, date: new Date() });
        await user.save();
        res.json({ message: 'Score updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get score history
router.get('/score/history', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.mentalHealthScore.history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get AI suggestions (placeholder)
router.get('/suggestions', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        const score = user.mentalHealthScore.current || 50;
        const suggestions = score < 50
            ? ['Try deep breathing exercises', 'Consider a short meditation session']
            : ['Maintain your routine', 'Engage in a hobby'];
        res.json({ suggestions });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;