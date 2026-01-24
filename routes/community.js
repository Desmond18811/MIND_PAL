
// Import Express and models
import express from 'express';
import Post from '../models/Post.js';
import User from '../models/User.js';

const router = express.Router();

// Create a new post
router.post('/posts', async (req, res) => {
    // Explanation: Creates a new community post
    try {
        const { content } = req.body;
        const post = new Post({ userId: req.user.userId, content });
        await post.save();
        res.status(201).json({ message: 'Post created', post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get post details
router.get('/posts/:id', async (req, res) => {
    // Explanation: Retrieves a post by ID
    try {
        const post = await Post.findById(req.params.id).populate('userId', 'username');
        if (!post) return res.status(404).json({ error: 'Post not found' });
        res.json(post);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a post
router.put('/posts/:id', async (req, res) => {
    // Explanation: Updates a post if owned by the user
    try {
        const { content } = req.body;
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        post.content = content;
        post.updatedAt = new Date();
        await post.save();
        res.json({ message: 'Post updated', post });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a post
router.delete('/posts/:id', async (req, res) => {
    // Explanation: Deletes a post if owned by the user
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ error: 'Post not found' });
        if (post.userId.toString() !== req.user.userId) {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: 'Post deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get community notifications
router.get('/notifications', async (req, res) => {
    // Explanation: Retrieves notifications for community interactions (placeholder)
    try {
        const user = await User.findById(req.user.userId);
        res.json(user.notifications.filter(n => n.message.includes('community')));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user profile for community
router.get('/profile/:userId', async (req, res) => {
    // Explanation: Retrieves a user's public profile for community interactions
    try {
        const user = await User.findById(req.params.userId).select('username profile.displayName');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;