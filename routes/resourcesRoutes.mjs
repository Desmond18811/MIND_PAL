import express from 'express';
import {
    fetchResources,
    getRecommendedResources,
    rateResource,
    searchResources
} from '../controllers/resourceController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();

// Public endpoints
router.get('/fetch', fetchResources); // Would be protected in production
router.get('/search', searchResources);

// Authenticated endpoints
router.use(authenticate);
router.get('/recommended', getRecommendedResources);
router.post('/:id/rate', rateResource);

export default router;