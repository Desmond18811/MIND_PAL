import express from 'express';
import {
    syncEpidemicSoundTracks,
    getMusicRecommendations,
    recordMusicPlay
} from '../controllers/musicController.mjs';
import authenticate from '../middleware/auth.mjs';


const router = express.Router();

// Public routes
router.get('/recommendations', getMusicRecommendations);

// Authenticated routes
router.use(authenticate);
router.post('/play', recordMusicPlay);

// Admin-only routes
//router.use(adminOnly);
router.post('/sync-epidemic', syncEpidemicSoundTracks);

export default router;