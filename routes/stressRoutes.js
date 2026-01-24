/**
 * Stress Routes - Handle stress management and facial analysis
 */

import express from 'express';
import multer from 'multer';
import { analyzeFacialExpression } from '../services/faceAnalysisService.js';
import authenticate from '../middleware/auth.js';
import DataPermission from '../models/DataPermission.js';

const router = express.Router();
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// All routes require authentication
router.use(authenticate);

/**
 * POST /api/stress/analyze-face
 * Analyze facial expression for stress/mood
 */
router.post('/analyze-face', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ status: 'error', message: 'No image provided' });
        }

        const result = await analyzeFacialExpression(req.file.buffer, req.file.mimetype);

        res.json({
            status: 'success',
            data: result.data
        });

    } catch (error) {
        console.error('Face analysis route error:', error);
        res.status(500).json({ status: 'error', message: 'Failed to analyze face' });
    }
});

/**
 * GET /api/stress/history
 * Get stress level history
 */
router.get('/history', async (req, res) => {
    // Placeholder for retrieving stress history
    res.json({
        status: 'success',
        data: []
    });
});

export default router;