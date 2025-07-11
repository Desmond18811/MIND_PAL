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
// export const forgotPassword = async (req, res) => {
//     try {
//         const { email } = req.body;
//
//         // Check if user exists
//         const user = await User.findOne({ email });
//         if (!user) {
//             return res.status(400).json({ error: 'User not found' });
//         }
//
//         // Generate a secret for OTP
//         const secret = speakeasy.generateSecret().base32;
//
//         // Generate OTP
//         const otp = speakeasy.totp({
//             secret: secret,
//             encoding: 'base32',
//             digits: 6,
//             step: 900 // 15 minutes in seconds
//         });
//
//         // Save OTP and secret to user
//         user.resetPasswordOTP = otp;
//         user.resetPasswordSecret = secret; // Store the secret
//         user.resetPasswordExpires = Date.now() + 15 * 60 * 1000; // 15 minutes
//         await user.save();
//
//         // Send OTP email
//         await sendOTPEmail(email, otp);
//
//         res.json({
//             message: 'OTP sent to your email',
//             userId: user._id // Send userId for OTP verification
//         });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

// Verify OTP and reset password
// export const resetPassword = async (req, res) => {
//     try {
//         const { userId, otp, newPassword } = req.body;
//
//         // Find user
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(400).json({ error: 'User not found' });
//         }
//
//         // Verify OTP using the stored secret
//         const isValidOTP = speakeasy.totp.verify({
//             secret: user.resetPasswordSecret,
//             encoding: 'base32',
//             token: otp,
//             window: 1, // Allow a small time window for clock drift
//             step: 900 // Match the step used in generation
//         });
//
//         // Check OTP validity and expiration
//         if (!isValidOTP || user.resetPasswordExpires < Date.now()) {
//             return res.status(400).json({ error: 'Invalid or expired OTP' });
//         }
//
//         // Update password and clear OTP fields
//         user.password = newPassword;
//         user.resetPasswordOTP = undefined;
//         user.resetPasswordSecret = undefined; // Clear the secret
//         user.resetPasswordExpires = undefined;
//         await user.save();
//
//         res.json({ message: 'Password reset successfully' });
//     } catch (err) {
//         res.status(500).json({ error: err.message });
//     }
// };

export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Generate a secret for OTP
        const secret = speakeasy.generateSecret({
            length: 20,
            name: `Password Reset (${user.email})`
        }).base32;

        // Generate OTP with current timestamp
        const otp = speakeasy.totp({
            secret: secret,
            encoding: 'base32',
            digits: 6,
            step: 300, // 5 minutes in seconds
            window: 0
        });

        // Save OTP and secret to user with additional metadata
        user.resetPasswordOTP = otp;
        user.resetPasswordSecret = secret;
        user.resetPasswordExpires = Date.now() + 5 * 60 * 1000; // 5 minutes
        user.resetPasswordAttempts = 0;
        await user.save();

        // Log the OTP generation (remove in production)
        console.log(`[DEBUG] Generated OTP for ${user.email}: ${otp}`);
        console.log(`[DEBUG] OTP valid until: ${new Date(user.resetPasswordExpires)}`);

        // Send OTP email
        await sendOTPEmail(email, otp);

        res.json({
            message: 'OTP sent to your email',
            userId: user._id,
            expiresIn: '5 minutes'
        });
    } catch (err) {
        console.error('Forgot password error:', err);
        res.status(500).json({
            error: 'Failed to process password reset',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
    }
};

export const resetPassword = async (req, res) => {
    try {
        const { userId, otp, newPassword } = req.body;

        // Input validation
        if (!userId || !otp || !newPassword) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(400).json({ error: 'User not found' });
        }

        // Check if OTP is expired
        if (user.resetPasswordExpires < Date.now()) {
            return res.status(400).json({
                error: 'OTP expired',
                solution: 'Request a new OTP'
            });
        }

        // Verify OTP using multiple methods
        let isValidOTP = false;

        // Method 1: Direct comparison (backup)
        if (user.resetPasswordOTP === otp) {
            isValidOTP = true;
        }
        // Method 2: Time-based verification (primary)
        else {
            isValidOTP = speakeasy.totp.verify({
                secret: user.resetPasswordSecret,
                encoding: 'base32',
                token: otp,
                window: 2, // Allows for 2 steps (10 minutes) of time drift
                step: 300 // Must match the step used in generation
            });
        }

        // Debug information (remove in production)
        console.log(`[DEBUG] OTP Verification for ${user.email}:`);
        console.log(`- Received OTP: ${otp}`);
        console.log(`- Stored OTP: ${user.resetPasswordOTP}`);
        console.log(`- Verification result: ${isValidOTP}`);
        console.log(`- Time remaining: ${Math.round((user.resetPasswordExpires - Date.now()) / 1000)} seconds`);

        if (!isValidOTP) {
            // Increment attempt counter
            user.resetPasswordAttempts = (user.resetPasswordAttempts || 0) + 1;
            await user.save();

            return res.status(400).json({
                error: 'Invalid OTP',
                attemptsRemaining: 5 - (user.resetPasswordAttempts || 0),
                hint: process.env.NODE_ENV === 'development' ?
                    `Expected: ${user.resetPasswordOTP}` : undefined
            });
        }

        // Update password and clear OTP fields
        user.password = newPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordSecret = undefined;
        user.resetPasswordExpires = undefined;
        user.resetPasswordAttempts = undefined;
        await user.save();

        res.json({
            message: 'Password reset successfully',
            nextSteps: 'You can now login with your new password'
        });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({
            error: 'Failed to reset password',
            details: process.env.NODE_ENV === 'development' ? err.message : undefined
        });
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