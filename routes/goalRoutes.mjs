import express from 'express';
import {
    createGoal,
    getGoals,
    updateGoal,
    deleteGoal,
    addMilestone,
    completeMilestone,
    getGoalStats
} from '../controllers/goalController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticate);

// Goal CRUD operations
router.post('/', createGoal);
router.get('/', getGoals);
router.put('/:id', updateGoal);
router.delete('/:id', deleteGoal);

// Milestone operations
router.post('/:id/milestones', addMilestone);
router.patch('/:id/milestones/:milestoneId/complete', completeMilestone);

// Statistics
router.get('/stats', getGoalStats);

export default router;