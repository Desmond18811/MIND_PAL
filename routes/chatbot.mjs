
// Import Express and ChatSession model
import express from 'express';
import ChatSession from '../models/ChatSession.mjs';

const router = express.Router();

// Start a new chat session
router.post('/session', async (req, res) => {
    // Explanation: Creates a new chatbot session for the user
    try {
        const session = new ChatSession({ userId: req.user.userId, messages: [] });
        await session.save();
        res.status(201).json({ message: 'Chat session started', sessionId: session._id });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get chat history
router.get('/history', async (req, res) => {
    // Explanation: Retrieves all chat sessions for the user
    try {
        const sessions = await ChatSession.find({ userId: req.user.userId });
        res.json(sessions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Send message to chatbot
router.post('/message', async (req, res) => {
    // Explanation: Adds a user message to a session and returns a bot response (placeholder)
    try {
        const { sessionId, content } = req.body;
        const session = await ChatSession.findById(sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        if (session.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        session.messages.push({ sender: 'user', content, timestamp: new Date() });
        // Placeholder bot response
        const botResponse = 'I hear you. How can I support you today?';
        session.messages.push({ sender: 'bot', content: botResponse, timestamp: new Date() });
        await session.save();
        res.json({ message: 'Message sent', botResponse });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Receive chatbot response (placeholder)
router.get('/message/:sessionId', async (req, res) => {
    // Explanation: Retrieves the latest bot response from a session
    try {
        const session = await ChatSession.findById(req.params.sessionId);
        if (!session) return res.status(404).json({ error: 'Session not found' });
        const lastBotMessage = session.messages
            .filter(msg => msg.sender === 'bot')
            .pop();
        res.json({ response: lastBotMessage?.content || 'No bot response yet' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
