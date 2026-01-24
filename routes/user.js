import express from 'express';
import User from '../models/User.js';

const router = express.Router();

// Get user profile
router.get('/profile', async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user.profile);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user profile
router.put('/profile', async (req, res) => {
    try {
        const { displayName, language, devices } = req.body;
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        user.profile = { displayName, language, devices };
        await user.save();
        res.json({ message: 'Profile updated', profile: user.profile });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user account
router.delete('/account', async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user.userId);
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ message: 'Account deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;