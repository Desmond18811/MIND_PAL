import express from 'express';
import assessmentControllers from "../controllers/assesmentControllers.js";
import authenticate from "../middleware/auth.js";


const router = express.Router();

// Protect all assessment routes

router.use(authenticate)
// Get assessment questions

router.get('/questions', assessmentControllers.getAssessmentQuestions);

// Submit assessment
router.post('/submit', assessmentControllers.submitAssessment);


export default router;