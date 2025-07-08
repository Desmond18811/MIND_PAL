import express from 'express';
import {
    createJournalEntry,
    getJournalAnalytics,
    getJournalEntry
} from '../controllers/journalController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticate);

router.post('/', createJournalEntry);
router.get('/', getJournalEntry);
router.get('/stats', getJournalAnalytics);

export default router;