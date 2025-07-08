import express from 'express';
import {
    getMeditationContent,
    createMeditationContent,
    startSession,
    endSession,
    getUserProgress,
    getRecommendations
} from '../controllers/meditationController.mjs';
import authenticate from '../middleware/auth.mjs';
//import adminOnly from '../middleware/permissions.mjs'

const router = express.Router();

// Public routes
router.get('/content', getMeditationContent);

// Authenticated routes
router.use(authenticate);

router.post('/sessions/start', startSession);
router.post('/sessions/end', endSession);
router.get('/progress', getUserProgress);
router.get('/recommendations', getRecommendations);

// Admin-only routes
//router.use(adminOnly);
router.post('/content', createMeditationContent);

export default router;