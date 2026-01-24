import express from 'express';
import {
    registerTherapist,
    getTherapistProfile,
    updateTherapistProfile,
    searchTherapists,
    rateTherapist,
    setAvailability,
    getTherapistStats,
    getOwnTherapistProfile
} from '../controllers/therapistController.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', searchTherapists);                    // Search/list therapists
router.get('/:id', getTherapistProfile);              // Get therapist by ID

// Protected routes (require authentication)
router.post('/register', authenticate, registerTherapist);        // Register as therapist
router.get('/profile/me', authenticate, getOwnTherapistProfile);  // Get own profile
router.put('/profile', authenticate, updateTherapistProfile);     // Update own profile
router.put('/availability', authenticate, setAvailability);       // Set availability
router.get('/stats/me', authenticate, getTherapistStats);         // Get own stats
router.post('/:id/rate', authenticate, rateTherapist);            // Rate a therapist

export default router;
