/**
 * Dataset Routes - Export training data and push to Hugging Face
 * Admin endpoints for managing Serenity's training data
 */

import express from 'express';
import { exportTrainingData, pushToHuggingFace, getDatasetStats } from '../services/datasetService.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /api/dataset/stats
 * Get training data statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const result = await getDatasetStats();

        res.json({
            status: result.success ? 'success' : 'error',
            data: result.success ? result.stats : undefined,
            message: result.error || undefined
        });
    } catch (error) {
        console.error('Dataset stats error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to get dataset stats'
        });
    }
});

/**
 * POST /api/dataset/export
 * Export conversation data as JSONL training format
 * Body: { minMessages?: number, maxSessions?: number, anonymize?: boolean }
 */
router.post('/export', async (req, res) => {
    try {
        const { minMessages, maxSessions, anonymize } = req.body;

        const result = await exportTrainingData({
            minMessages: minMessages || 4,
            maxSessions: maxSessions || 1000,
            anonymize: anonymize !== false // default true
        });

        if (!result.success) {
            return res.status(404).json({
                status: 'error',
                message: result.message || result.error
            });
        }

        // Return as downloadable JSONL or JSON response
        if (req.query.format === 'file') {
            res.setHeader('Content-Type', 'application/jsonl');
            res.setHeader('Content-Disposition', `attachment; filename=serenity_training_${new Date().toISOString().split('T')[0]}.jsonl`);
            return res.send(result.data);
        }

        res.json({
            status: 'success',
            data: result.data,
            stats: result.stats
        });

    } catch (error) {
        console.error('Dataset export error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to export dataset'
        });
    }
});

/**
 * POST /api/dataset/push-to-hf
 * Export and push training data to Hugging Face repository
 * Body: { minMessages?: number, maxSessions?: number, commitMessage?: string }
 */
router.post('/push-to-hf', async (req, res) => {
    try {
        const { minMessages, maxSessions, commitMessage } = req.body;

        // First export the data
        const exportResult = await exportTrainingData({
            minMessages: minMessages || 4,
            maxSessions: maxSessions || 1000,
            anonymize: true // Always anonymize when pushing to HF
        });

        if (!exportResult.success) {
            return res.status(404).json({
                status: 'error',
                message: exportResult.message || exportResult.error
            });
        }

        // Push to Hugging Face
        const pushResult = await pushToHuggingFace(exportResult.data, {
            commitMessage: commitMessage || 'Add training data from MindPal conversations'
        });

        if (!pushResult.success) {
            return res.status(500).json({
                status: 'error',
                message: pushResult.error
            });
        }

        res.json({
            status: 'success',
            data: {
                url: pushResult.url,
                stats: exportResult.stats
            }
        });

    } catch (error) {
        console.error('HF push error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to push dataset to Hugging Face'
        });
    }
});

export default router;
