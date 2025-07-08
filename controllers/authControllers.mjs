import bcrypt from "bcryptjs";
import jwt from 'jsonwebtoken';
import speakeasy from "speakeasy";
import User from '../models/User.mjs';
import {
    sendWelcomeEmail,
    sendWelcomeBackEmail,
    sendOTPEmail
} from '../utils/emailSender.mjs';


// Register a new user
export const register = async (req, res) => {
    try {
        const { email, password, username } = req.body;

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        // Create new user
        const user = new User({ email, password, username });
        await user.save();

        // Send welcome email
        await sendWelcomeEmail(email, username);

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.status(201).json({
            message: 'User registered successfully',
            token,
       data: {
                id: user._id,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
       }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};


// Login user
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        // Send welcome back email
        await sendWelcomeBackEmail(email, user.username);

        // Generate token
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
            expiresIn: '1h'
        });

        res.json({
            message: 'Login successful',
            token,
        data: {
            user: {
                id: user._id,
                email: user.email,
                username: user.username,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                twoFactorSecret: user.twoFactorSecret,
                resetPasswordToken: user.resetPasswordToken,
                resetPasswordExpires: user.resetPasswordExpires,
                lastLogin: new Date()

            }
        }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Forgot password (send OTP)
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Generate OTP
        const otp = speakeasy.totp({
            secret: speakeasy.generateSecret().base32,
            digits: 6,
            step: 900 // 15 minutes in seconds
        });

        // Save OTP to user
        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
        await user.save();

        // Send OTP email
        await sendOTPEmail(email, otp);

        res.json({
            message: 'OTP sent to your email',
            userId: user._id // Send userId for OTP verification
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Verify OTP and reset password
export const resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Check OTP
        if (user.resetPasswordOTP !== otp ||
            user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        // Update password and clear OTP fields
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Verify 2FA
export const verify2FA = async (req, res) => {
    try {
        const { userId, token } = req.body;
        const user = await User.findById(userId);

        if (!user || !user.twoFactorSecret) {
            return res.status(400).json({ error: '2FA not set up' });
        }

        const verified = speakeasy.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token,
            window: 1
        });

        if (verified) {
            res.json({ message: '2FA verified' });
        } else {
            res.status(400).json({ error: 'Invalid 2FA token' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};