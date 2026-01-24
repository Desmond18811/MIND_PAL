/**
 * Serenity AI REST Routes
 * Fallback HTTP endpoints for Serenity interactions
 */

import express from 'express';
import { createSerenityAgent } from '../agents/SerenityAgent.js';
import ChatSession from '../models/ChatSession.js';
import DataPermission from '../models/DataPermission.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/serenity/chat
 * Send a message to Serenity and get a response
 */
router.post('/chat', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        const userId = req.user._id;

        if (!message || message.trim() === '') {
            return res.status(400).json({
                status: 'error',
                message: 'Message is required'
            });
        }

        // Create agent for this user
        const agent = await createSerenityAgent(userId);

        // Get or create session
        let session;
        if (sessionId) {
            session = await ChatSession.findById(sessionId);
            if (!session || session.userId.toString() !== userId.toString()) {
                session = null;
            }
        }

        if (!session) {
            session = new ChatSession({
                userId,
                sessionType: 'text',
                messages: []
            });
            await session.save();
        }

        // Handle message
        const response = await agent.handleMessage(message, session._id, 'text');

        res.json({
            status: 'success',
            data: {
                sessionId: response.sessionId,
                message: response.response,
                sentiment: response.sentiment,
                timestamp: response.timestamp
            }
        });

    } catch (error) {
        console.error('Serenity chat error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to process message'
        });
    }
});

/**
 * GET /api/serenity/sessions
 * Get all chat sessions for the user
 */
router.get('/sessions', async (req, res) => {
    try {
        const userId = req.user._id;
        const sessions = await ChatSession.find({ userId })
            .select('_id sessionType createdAt metadata')
            .sort({ createdAt: -1 })
            .limit(20);

        res.json({
            status: 'success',
            data: sessions
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get sessions'
        });
    }
});

/**
 * GET /api/serenity/session/:id
 * Get a specific chat session with messages
 */
router.get('/session/:id', async (req, res) => {
    try {
        const userId = req.user._id;
        const session = await ChatSession.findById(req.params.id);

        if (!session || session.userId.toString() !== userId.toString()) {
            return res.status(404).json({
                status: 'error',
                message: 'Session not found'
            });
        }

        res.json({
            status: 'success',
            data: session
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get session'
        });
    }
});

/**
 * POST /api/serenity/session
 * Create a new chat session
 */
router.post('/session', async (req, res) => {
    try {
        const userId = req.user._id;
        const session = new ChatSession({
            userId,
            sessionType: req.body.type || 'text',
            messages: []
        });
        await session.save();

        res.status(201).json({
            status: 'success',
            data: {
                sessionId: session._id,
                createdAt: session.createdAt
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to create session'
        });
    }
});

/**
 * GET /api/serenity/insights
 * Get personalized insights from Serenity
 */
router.get('/insights', async (req, res) => {
    try {
        const userId = req.user._id;
        const agent = await createSerenityAgent(userId);
        const insights = await agent.generateUserInsights();

        if (insights.needsPermission) {
            return res.status(403).json({
                status: 'permission_required',
                message: insights.message
            });
        }

        res.json({
            status: 'success',
            data: insights
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to generate insights'
        });
    }
});

/**
 * GET /api/serenity/suggestions
 * Get activity suggestions based on current state
 */
router.get('/suggestions', async (req, res) => {
    try {
        const userId = req.user._id;
        const { mood, timeOfDay } = req.query;

        const agent = await createSerenityAgent(userId);
        const suggestions = await agent.suggestActivities(
            parseInt(mood) || 5,
            timeOfDay || 'afternoon'
        );

        res.json({
            status: 'success',
            data: suggestions
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get suggestions'
        });
    }
});

/**
 * GET /api/serenity/permissions
 * Get current data permissions
 */
router.get('/permissions', async (req, res) => {
    try {
        const userId = req.user._id;
        const permission = await DataPermission.getOrCreate(userId);

        res.json({
            status: 'success',
            data: {
                permissions: permission.permissions,
                grantedAt: permission.grantedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get permissions'
        });
    }
});

/**
 * POST /api/serenity/permissions
 * Update data permissions
 */
router.post('/permissions', async (req, res) => {
    try {
        const userId = req.user._id;
        const { permissions } = req.body;

        if (!permissions || typeof permissions !== 'object') {
            return res.status(400).json({
                status: 'error',
                message: 'Permissions object required'
            });
        }

        const permission = await DataPermission.getOrCreate(userId);

        // Update each permission
        Object.entries(permissions).forEach(([key, value]) => {
            if (value === true) {
                permission.grantPermission(key, {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                });
            } else if (value === false) {
                permission.revokePermission(key, {
                    ipAddress: req.ip,
                    userAgent: req.get('User-Agent')
                });
            }
        });

        await permission.save();

        res.json({
            status: 'success',
            data: {
                permissions: permission.permissions,
                grantedAt: permission.grantedAt
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update permissions'
        });
    }
});

/**
 * POST /api/serenity/permissions/grant-all
 * Grant all data permissions at once
 */
router.post('/permissions/grant-all', async (req, res) => {
    try {
        const userId = req.user._id;
        const permission = await DataPermission.getOrCreate(userId);

        permission.grantAll({
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        await permission.save();

        res.json({
            status: 'success',
            message: 'All permissions granted',
            data: {
                permissions: permission.permissions
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to grant permissions'
        });
    }
});

/**
 * POST /api/serenity/permissions/revoke-all
 * Revoke all data permissions at once
 */
router.post('/permissions/revoke-all', async (req, res) => {
    try {
        const userId = req.user._id;
        const permission = await DataPermission.getOrCreate(userId);

        permission.revokeAll({
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });

        await permission.save();

        res.json({
            status: 'success',
            message: 'All permissions revoked',
            data: {
                permissions: permission.permissions
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to revoke permissions'
        });
    }
});

export default router;
