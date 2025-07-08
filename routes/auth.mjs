import express from 'express';
import {
    register,
    login,
    forgotPassword,
    resetPassword,
    verify2FA
} from '../controllers/authControllers.mjs';

const router = express.Router();

// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-2fa', verify2FA);

export default router;