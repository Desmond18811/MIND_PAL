import express from 'express';
import {
    startSleepSession,
    endSleepSession,
    getSleepStats,
    setSleepSchedule
} from '../controllers/sleepController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

// Sleep tracking
router.post('/sessions/start', startSleepSession);
router.post('/sessions/end', endSleepSession);

// Sleep data
router.get('/stats', getSleepStats);

// Schedule management
router.put('/schedule', setSleepSchedule);
router.get('/schedule', (req, res) => {
    // Implementation would mirror setSleepSchedule but for GET
});

export default router;