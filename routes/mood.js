import express from 'express';
import {
    recordMood,
    getMoodHistory
} from '../controllers/moodController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();
router.use(authenticate);

router.post('/', recordMood);
router.get('/history', getMoodHistory);

export default router;