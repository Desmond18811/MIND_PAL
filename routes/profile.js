import express from 'express';
import {
    createProfile,
    getProfile,
    updateProfile,
    deleteProfile,
    getProfileOptions
} from '../controllers/profile.js';
import authenticate from '../middleware/auth.js';

const router = express.Router();

// Apply authentication middleware to all profile routes
router.use(authenticate);

// Profile setup and management routes
router.post('/', createProfile); // Create a new profile (first-time setup)
router.get('/', getProfile); // Get user profile
router.put('/', updateProfile); // Update profile
router.delete('/', deleteProfile); // Delete profile

// Profile options for frontend forms
router.get('/options', getProfileOptions); // Get available options for profile fields

export default router;

