import express from 'express';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import {
    register,
    login,
    forgotPassword,
    resetPassword,
    verify2FA
} from '../controllers/authControllers.js';

const router = express.Router();

// Auth routes
// Auth routes
router.post('/register', register);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/verify-2fa', verify2FA);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/google/callback',
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
        // Successful authentication, generate token
        const token = jwt.sign({ userId: req.user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        // Redirect to mobile app with token (using deep linking)
        // Adjust the scheme (mindpal://) and path as needed for your app's navigation
        res.redirect(`mindpal://auth?token=${token}`);
    }
);

export default router;