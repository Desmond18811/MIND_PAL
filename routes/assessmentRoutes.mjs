import express from 'express';
import assessmentControllers from "../controllers/assesmentControllers.mjs";
import authenticate from "../middleware/auth.mjs";


const router = express.Router();

// Protect all assessment routes

router.use(authenticate)
// Get assessment questions

router.get('/questions', assessmentControllers.getAssessmentQuestions);

// Submit assessment
router.post('/submit', assessmentControllers.submitAssessment);


export default router;