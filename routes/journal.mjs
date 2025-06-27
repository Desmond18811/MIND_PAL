
// Import Express and User model
import express from 'express';
import User from '../models/User.mjs';

const router = express.Router();

// Create journal entry
router.post('/entries', async (req, res) => {
    // Explanation: Creates a new journal entry for the user
    try {
        const { content } = req.body;
        const user = await User.findById(req.user.userId);
        user.journal.push({ content, date: new Date() });
        await user.save();
        res.status(201).json({ message: 'Journal entry created' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get journal entries
router.get('/entries', async (req, res) => {
    // Explanation: Retrieves the user's journal entries
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.journal);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update journal entry
router.put('/entries/:id', async (req, res) => {
    // Explanation: Updates a specific journal entry
    try {
        const { content } = req.body;
        const user = await User.findById(req.user.userId);
        const entry = user.journal.id(req.params.id);
        if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
        entry.content = content;
        entry.date = new Date();
        await user.save();
        res.json({ message: 'Journal entry updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete journal entry
router.delete('/entries/:id', async (req, res) => {
    // Explanation: Deletes a specific journal entry
    try {
        const user = await User.findById(req.user.userId);
        const entry = user.journal.id(req.params.id);
        if (!entry) return res.status(404).json({ error: 'Journal entry not found' });
        user.journal.pull({ _id: req.params.id });
        await user.save();
        res.json({ message: 'Journal entry deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;