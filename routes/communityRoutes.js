/**
 * Community Routes - "The Vent" Social Features
 * Handles posts, anonymity, and feed generation
 */

import express from 'express';
import Post from '../models/Post.js';
import Comment from '../models/Comment.js';
import authenticate from '../middleware/auth.js';
import { analyzeTextSentiment } from '../agents/aiAdapter.js';

const router = express.Router();

// All routes require auth
router.use(authenticate);

/**
 * GET /api/community/feed
 * Get global feed of posts
 */
router.get('/feed', async (req, res) => {
    try {
        const { page = 1, limit = 20, tag } = req.query;

        const query = { isDeleted: false, flagged: false };
        if (tag) {
            query.tags = tag;
        }

        const posts = await Post.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit))
            .populate('userId', 'profile.displayName profile.avatar')
            .lean();

        // Transform for privacy
        const safePosts = posts.map(post => {
            if (post.isAnonymous) {
                post.userId = {
                    _id: null,
                    displayName: 'Anonymous User',
                    avatar: null // Default anonymous avatar on client
                };
            }
            // Add userLiked flag
            post.userLiked = post.likes.some(id => id.toString() === req.user.userId);
            delete post.likes; // Don't send full like list
            return post;
        });

        res.json({
            status: 'success',
            data: safePosts,
            page: parseInt(page)
        });

    } catch (error) {
        console.error('Feed error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to load feed' });
    }
});

/**
 * POST /api/community/posts
 * Create a new post (rant/vent)
 */
router.post('/posts', async (req, res) => {
    try {
        const { content, isAnonymous, tags } = req.body;

        if (!content) {
            return res.status(400).json({ status: 'error', message: 'Content is required' });
        }

        // Auto-analyze sentiment for ML tracking
        const sentiment = await analyzeTextSentiment(content);

        const post = new Post({
            userId: req.user.userId,
            content,
            isAnonymous: !!isAnonymous,
            tags: tags || [],
            sentiment: {
                score: sentiment.score,
                label: sentiment.sentiment,
                analyzedAt: new Date()
            }
        });

        await post.save();

        // Populate user info for immediate display
        await post.populate('userId', 'profile.displayName profile.avatar');

        // If anonymous, mask return data
        const responseData = post.toObject();
        if (responseData.isAnonymous) {
            responseData.userId = {
                displayName: 'Anonymous User',
                avatar: null
            };
        }

        res.status(201).json({
            status: 'success',
            data: responseData
        });

    } catch (error) {
        console.error('Create post error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to create post' });
    }
});

/**
 * POST /api/community/posts/:id/like
 * Like/Unlike a post
 */
router.post('/posts/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const userId = req.user.userId;
        const index = post.likes.indexOf(userId);

        if (index === -1) {
            post.likes.push(userId);
            post.likeCount++;
        } else {
            post.likes.splice(index, 1);
            post.likeCount--;
        }

        await post.save();

        res.json({
            status: 'success',
            liked: index === -1,
            likeCount: post.likeCount
        });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Action failed' });
    }
});

/**
 * POST /api/community/posts/:id/comments
 * Add a comment
 */
router.post('/posts/:id/comments', async (req, res) => {
    try {
        const { content, isAnonymous } = req.body;

        const comment = new Comment({
            postId: req.params.id,
            userId: req.user.userId,
            content,
            isAnonymous: !!isAnonymous
        });

        await comment.save();

        // Update post comment count
        await Post.findByIdAndUpdate(req.params.id, { $inc: { commentCount: 1 } });

        await comment.populate('userId', 'profile.displayName profile.avatar');

        const responseData = comment.toObject();
        if (responseData.isAnonymous) {
            responseData.userId = { displayName: 'Anonymous User', avatar: null };
        }

        res.status(201).json({ status: 'success', data: responseData });

    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to comment' });
    }
});

/**
 * GET /api/community/posts/:id/comments
 * Get comments for a post
 */
router.get('/posts/:id/comments', async (req, res) => {
    try {
        const comments = await Comment.find({ postId: req.params.id })
            .sort({ createdAt: 1 })
            .populate('userId', 'profile.displayName profile.avatar')
            .lean();

        const safeComments = comments.map(c => {
            if (c.isAnonymous) {
                c.userId = { displayName: 'Anonymous User', avatar: null };
            }
            return c;
        });

        res.json({ status: 'success', data: safeComments });
    } catch (error) {
        res.status(500).json({ status: 'error', message: 'Failed to load comments' });
    }
});

export default router;
