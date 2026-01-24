import Profile from '../models/Profile.js';
import mongoose from 'mongoose';

/**
 * Create a new profile (for first-time setup)
 */
export const createProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const  userId  = req.user._id;
        const profileData = req.body;

        // Check if a profile already exists
        const existingProfile = await Profile.findOne({ userId }).session(session);
        if (existingProfile) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: 'error',
                message: 'Profile already exists for this user'
            });
        }

        // Create a new profile
        const newProfile = new Profile({
            userId,
            ...profileData
        });

        await newProfile.save({ session });
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            status: 'success',
            message: 'Profile created successfully',
            data: newProfile
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error creating profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to create profile',
            error: error.message
        });
    }
};

/**
 * Get user profile
 */
export const getProfile = async (req, res) => {
    try {
        const  userId  = req.user._id;

        const profile = await Profile.findOne({ userId })
            .populate('userId', 'email username') // Include basic user info
            .lean();

        if (!profile) {
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        res.status(200).json({
            status: 'success',
            data: profile
        });
    } catch (error) {
        console.error('Error fetching profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch profile',
            error: error.message
        });
    }
};

/**
 * Update user profile
 */
export const updateProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const  userId  = req.user._id;
        const updateData = req.body;

        // Find and update profile
        const updatedProfile = await Profile.findOneAndUpdate(
            { userId },
            updateData,
            { new: true, runValidators: true, session }
        );

        if (!updatedProfile) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            status: 'success',
            message: 'Profile updated successfully',
            data: updatedProfile
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error updating profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile',
            error: error.message
        });
    }
};

/**
 * Delete user profile
 */
export const deleteProfile = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { userId } = req.user._id;

        const deletedProfile = await Profile.findOneAndDelete({ userId }).session(session);

        if (!deletedProfile) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: 'error',
                message: 'Profile not found'
            });
        }

        await session.commitTransaction();
        session.endSession();

        res.status(200).json({
            status: 'success',
            message: 'Profile deleted successfully'
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error deleting profile:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete profile',
            error: error.message
        });
    }
};

/**
 * Get profile settings options (for frontend forms)
 */
export const getProfileOptions = async (req, res) => {
    try {
        // These could be dynamic from database if needed
        const options = {
            genders: [
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
                { value: 'other', label: 'Other' },
                { value: 'prefer-not-to-say', label: 'Prefer not to say' }
            ],
            bloodTypes: [
                'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
            ],
            themes: [
                { value: 'light', label: 'Light' },
                { value: 'dark', label: 'Dark' },
                { value: 'system', label: 'System Default' }
            ],
            languages: [
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' }
                // Add more as needed
            ]
        };

        res.status(200).json({
            status: 'success',
            data: options
        });
    } catch (error) {
        console.error('Error fetching profile options:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to fetch profile options',
            error: error.message
        });
    }
};