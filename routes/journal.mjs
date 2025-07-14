import express from 'express';
import {
    createJournalEntry,
    getJournalEntry,
    getJournalAnalytics,
    streamAudio,
    handleAudioUpload
} from '../controllers/journalController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticate);

// Journal entries
router.route('/')
    .post(handleAudioUpload, createJournalEntry);

// Specific journal entry and audio
router.route('/:id')
    .get(getJournalEntry);

router.get('/:id/audio', streamAudio);

// Analytics (must come after /:id route)
router.get('/stats', getJournalAnalytics);

export default router;
