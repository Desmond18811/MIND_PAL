import Therapist from '../models/Therapist.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// Register as a therapist (requires existing user account)
export const registerTherapist = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { licenseNumber, professionalInfo, bio, languages, availability, pricing } = req.body;

        // Check if already registered as therapist
        const existingTherapist = await Therapist.findOne({ userId }).session(session);
        if (existingTherapist) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: 'error',
                message: 'User is already registered as a therapist'
            });
        }

        // Create therapist profile
        const therapist = await Therapist.create([{
            userId,
            licenseNumber,
            professionalInfo,
            bio,
            languages: languages || ['English'],
            availability,
            pricing,
            status: 'pending'  // Requires verification
        }], { session });

        // Update user role (add role field if you want to track it)
        await User.findByIdAndUpdate(
            userId,
            { $set: { role: 'therapist' } },
            { session }
        );

        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            status: 'success',
            message: 'Therapist profile created. Pending verification.',
            data: therapist[0]
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Therapist registration error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to register as therapist',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get therapist profile by ID
export const getTherapistProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const therapist = await Therapist.findById(id)
            .populate('userId', 'username email profile.displayName');

        if (!therapist) {
            return res.status(404).json({
                status: 'error',
                message: 'Therapist not found'
            });
        }

        res.json({
            status: 'success',
            data: therapist
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get therapist profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update therapist profile (own profile only)
export const updateTherapistProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const updates = req.body;

        // Prevent updating sensitive fields
        delete updates.userId;
        delete updates.isVerified;
        delete updates.verifiedAt;
        delete updates.status;
        delete updates.rating;
        delete updates.completedSessions;

        const therapist = await Therapist.findOneAndUpdate(
            { userId },
            { $set: updates },
            { new: true, runValidators: true }
        );

        if (!therapist) {
            return res.status(404).json({
                status: 'error',
                message: 'Therapist profile not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Profile updated successfully',
            data: therapist
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Search therapists with filters
export const searchTherapists = async (req, res) => {
    try {
        const {
            specialization,
            language,
            sessionType,
            minRate,
            maxRate,
            minRating,
            limit = 20,
            page = 1
        } = req.query;

        let query = { status: 'active', isVerified: true };

        if (specialization) {
            query['professionalInfo.specializations'] = specialization;
        }
        if (language) {
            query.languages = language;
        }
        if (sessionType) {
            query['availability.sessionTypes'] = sessionType;
        }
        if (minRate || maxRate) {
            query['pricing.hourlyRate'] = {};
            if (minRate) query['pricing.hourlyRate'].$gte = parseFloat(minRate);
            if (maxRate) query['pricing.hourlyRate'].$lte = parseFloat(maxRate);
        }
        if (minRating) {
            query['rating.average'] = { $gte: parseFloat(minRating) };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [therapists, total] = await Promise.all([
            Therapist.find(query)
                .populate('userId', 'username profile.displayName')
                .sort({ 'rating.average': -1, completedSessions: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Therapist.countDocuments(query)
        ]);

        res.json({
            status: 'success',
            data: {
                therapists,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / parseInt(limit)),
                    limit: parseInt(limit)
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to search therapists',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Rate therapist (after completed session)
export const rateTherapist = async (req, res) => {
    try {
        const { id } = req.params;
        const { rating, feedback } = req.body;
        const userId = req.user._id;

        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 'error',
                message: 'Rating must be between 1 and 5'
            });
        }

        const therapist = await Therapist.findById(id);
        if (!therapist) {
            return res.status(404).json({
                status: 'error',
                message: 'Therapist not found'
            });
        }

        // Calculate new average rating
        const newCount = therapist.rating.count + 1;
        const newAverage = ((therapist.rating.average * therapist.rating.count) + rating) / newCount;

        await Therapist.findByIdAndUpdate(id, {
            $set: {
                'rating.average': Math.round(newAverage * 10) / 10,
                'rating.count': newCount
            }
        });

        res.json({
            status: 'success',
            message: 'Rating submitted successfully',
            data: {
                newAverage: Math.round(newAverage * 10) / 10,
                totalRatings: newCount
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to submit rating',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Set/update availability
export const setAvailability = async (req, res) => {
    try {
        const userId = req.user._id;
        const { schedule, sessionDuration, sessionTypes, timezone } = req.body;

        const therapist = await Therapist.findOneAndUpdate(
            { userId },
            {
                $set: {
                    'availability.schedule': schedule,
                    'availability.sessionDuration': sessionDuration,
                    'availability.sessionTypes': sessionTypes,
                    'availability.timezone': timezone
                }
            },
            { new: true }
        );

        if (!therapist) {
            return res.status(404).json({
                status: 'error',
                message: 'Therapist profile not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Availability updated successfully',
            data: therapist.availability
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update availability',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get therapist stats (for therapist dashboard)
export const getTherapistStats = async (req, res) => {
    try {
        const userId = req.user._id;

        const therapist = await Therapist.findOne({ userId });
        if (!therapist) {
            return res.status(404).json({
                status: 'error',
                message: 'Therapist profile not found'
            });
        }

        // Import Appointment model for stats
        const Appointment = (await import('../models/Appointment.js')).default;

        const now = new Date();
        const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const [totalAppointments, monthlyAppointments, upcomingAppointments] = await Promise.all([
            Appointment.countDocuments({ therapistId: therapist._id, status: 'completed' }),
            Appointment.countDocuments({
                therapistId: therapist._id,
                status: 'completed',
                scheduledAt: { $gte: thisMonth }
            }),
            Appointment.countDocuments({
                therapistId: therapist._id,
                status: { $in: ['pending', 'confirmed'] },
                scheduledAt: { $gte: now }
            })
        ]);

        res.json({
            status: 'success',
            data: {
                rating: therapist.rating,
                completedSessions: therapist.completedSessions,
                totalAppointments,
                monthlyAppointments,
                upcomingAppointments,
                status: therapist.status,
                isVerified: therapist.isVerified
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get stats',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get own therapist profile
export const getOwnTherapistProfile = async (req, res) => {
    try {
        const userId = req.user._id;

        const therapist = await Therapist.findOne({ userId })
            .populate('userId', 'username email profile.displayName');

        if (!therapist) {
            return res.status(404).json({
                status: 'error',
                message: 'Therapist profile not found'
            });
        }

        res.json({
            status: 'success',
            data: therapist
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get profile',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
