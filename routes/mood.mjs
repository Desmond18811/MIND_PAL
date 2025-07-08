import express from 'express';
import {
    recordMood,
    getMoodHistory
} from '../controllers/moodController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticate);

router.post('/', recordMood);
router.get('/history', getMoodHistory);

export default router;