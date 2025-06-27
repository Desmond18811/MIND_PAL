import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import nodemailer from 'nodemailer';
import User from '../models/User.mjs';

const router = express.Router();

// Configure Nodemailer (update with your email service)
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    try {
        const { email, password, username } = req.body;
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ error: 'Email already exists' });

        const user = new User({ email, password, username });
        await user.save();

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.status(201).json({ message: 'User registered', token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Forgot password (send reset link)
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ error: 'User not found' });

        const token = jwt.sign({ userId: user._id }, process.env.RESET_PASSWORD_KEY, { expiresIn: '15m' });
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        const mailOptions = {
            to: email,
            subject: 'Reset Password',
            html: `<p>Click <a href="${process.env.CLIENT_URL}/reset?token=${token}">here</a> to reset your password.</p>`
        };
        await transporter.sendMail(mailOptions);
        res.json({ message: 'Reset link sent' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Reset password
router.post('/reset-password', async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });
        if (!user) return res.status(400).json({ error: 'Invalid or expired token' });

        user.password = newPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Verify 2FA
router.post('/verify-2fa', async (req, res) => {
    try {
        const { userId, token } = req.body;
        const user = await User.findById(userId);
        if (!user || !user.twoFactorSecret) return res.status(400).json({ error: '2FA not set up' });

        const verified = speakeasy.top.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token
        });
        if (verified) {
            res.json({ message: '2FA verified' });
        } else {
            res.status(400).json({ error: 'Invalid 2FA token' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;