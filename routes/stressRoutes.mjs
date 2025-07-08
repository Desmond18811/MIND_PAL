import express from 'express';
import {
    createStressEntry,
    getStressEntries,
    getStressStats
} from '../controllers/stressController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticate);

// Stress entry CRUD operations
router.post('/', createStressEntry);
router.get('/', getStressEntries);

// Analytics
router.get('/stats', getStressStats);

export default router;