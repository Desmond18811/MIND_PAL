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

// Analytics (must come before /:id route)
router.get('/stats', getJournalAnalytics);

// Specific journal entry and audio
router.route('/:id')
    .get(getJournalEntry);

router.get('/:id/audio', streamAudio);

export default router;