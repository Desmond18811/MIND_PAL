
// Import Express and HelpTopic model
import express from 'express';
import HelpTopic from '../models/HelpTopic.js';

const router = express.Router();

// Get help center topics
router.get('/topics', async (req, res) => {
    // Explanation: Retrieves all help topics
    try {
        const topics = await HelpTopic.find().select('title category');
        res.json(topics);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Submit feedback
router.post('/feedback', async (req, res) => {
    // Explanation: Saves user feedback (placeholder, no model for feedback)
    try {
        const { content } = req.body;
        // In a real app, save feedback to a Feedback model or external service
        res.status(201).json({ message: 'Feedback submitted', content });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Initiate live chat support (placeholder)
router.post('/live-chat', async (req, res) => {
    // Explanation: Placeholder for initiating live chat (requires WebSocket)
    try {
        res.json({ message: 'Live chat initiated (placeholder)' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;