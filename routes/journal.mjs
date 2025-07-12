import express from 'express';
import {
    createJournalEntry,
    getJournalEntry,
    getJournalAnalytics
} from '../controllers/journalController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();

// Apply authentication to all journal routes
router.use(authenticate);

// POST /api/journal - Create new journal entry
router.post('/', createJournalEntry);

// GET /api/journal/:id - Get specific journal entry
router.get('/:id', getJournalEntry);

// GET /api/journal/stats?period=month - Get journal analytics
router.get('/stats', getJournalAnalytics);

export default router;