import express from 'express'
import {
  getPalScore,
  getScoreHistory,
  getScoreInsights,
} from '../controllers/palScoreController.mjs'
import authenticate from '../middleware/auth.mjs'

const router = express.Router()
router.use(authenticate)
// Get Pal score for the authenticated user

router.get('/', authenticate, getPalScore)
// Get Pal score history with optional filters
router.get('/history', authenticate, getScoreHistory)
// Get Pal score insights and analytics
router.get('/insights', authenticate, getScoreInsights)

export default router