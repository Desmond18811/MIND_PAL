import Appointment from '../models/Appointment.mjs';
import Therapist from '../models/Therapist.mjs';
import { updateScore } from './palScoreController.mjs';
import { createNotification } from './notificationController.mjs';
import mongoose from 'mongoose';

// Book a new appointment
export const bookAppointment = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const userId = req.user._id;
        const { therapistId, scheduledAt, duration, type, notes, moodBefore } = req.body;

        // Validate therapist exists and is active
        const therapist = await Therapist.findById(therapistId).session(session);
        if (!therapist || therapist.status !== 'active') {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: 'error',
                message: 'Therapist not found or not available'
            });
        }

        // Check for scheduling conflicts
        const appointmentDate = new Date(scheduledAt);
        const endTime = new Date(appointmentDate.getTime() + (duration || 60) * 60 * 1000);

        const conflictingAppointment = await Appointment.findOne({
            therapistId,
            status: { $in: ['pending', 'confirmed'] },
            $or: [
                {
                    scheduledAt: { $lt: endTime },
                    $expr: {
                        $gt: [
                            { $add: ['$scheduledAt', { $multiply: ['$duration', 60000] }] },
                            appointmentDate
                        ]
                    }
                }
            ]
        }).session(session);

        if (conflictingAppointment) {
            await session.abortTransaction();
            session.endSession();
            return res.status(400).json({
                status: 'error',
                message: 'Time slot not available'
            });
        }

        // Calculate payment amount
        const paymentAmount = therapist.pricing.hourlyRate * ((duration || 60) / 60);

        // Create appointment
        const [appointment] = await Appointment.create([{
            userId,
            therapistId,
            scheduledAt: appointmentDate,
            duration: duration || therapist.availability.sessionDuration,
            type: type || therapist.availability.sessionTypes[0],
            moodBefore,
            notes: {
                preMeeting: notes
            },
            payment: {
                amount: paymentAmount,
                currency: therapist.pricing.currency,
                status: 'pending'
            }
        }], { session });

        await session.commitTransaction();
        session.endSession();

        // TODO: Send notification to therapist
        // await createNotification(therapist.userId, { ... });

        res.status(201).json({
            status: 'success',
            message: 'Appointment booked successfully',
            data: appointment
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        console.error('Booking error:', error);
        res.status(500).json({
            status: 'error',
            message: 'Failed to book appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get user's appointments
export const getAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, upcoming, limit = 20, page = 1 } = req.query;

        let query = { userId };

        if (status) {
            query.status = status;
        }
        if (upcoming === 'true') {
            query.scheduledAt = { $gte: new Date() };
            query.status = { $in: ['pending', 'confirmed'] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .populate({
                    path: 'therapistId',
                    select: 'professionalInfo bio profilePicture rating',
                    populate: {
                        path: 'userId',
                        select: 'username profile.displayName'
                    }
                })
                .sort({ scheduledAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Appointment.countDocuments(query)
        ]);

        res.json({
            status: 'success',
            data: {
                appointments,
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
            message: 'Failed to get appointments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get therapist's appointments
export const getTherapistAppointments = async (req, res) => {
    try {
        const userId = req.user._id;
        const { status, upcoming, limit = 20, page = 1 } = req.query;

        // Find therapist profile
        const therapist = await Therapist.findOne({ userId });
        if (!therapist) {
            return res.status(404).json({
                status: 'error',
                message: 'Therapist profile not found'
            });
        }

        let query = { therapistId: therapist._id };

        if (status) {
            query.status = status;
        }
        if (upcoming === 'true') {
            query.scheduledAt = { $gte: new Date() };
            query.status = { $in: ['pending', 'confirmed'] };
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [appointments, total] = await Promise.all([
            Appointment.find(query)
                .populate('userId', 'username email profile.displayName')
                .sort({ scheduledAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            Appointment.countDocuments(query)
        ]);

        // Include therapist notes for therapist view
        const appointmentsWithNotes = appointments.map(apt => {
            const obj = apt.toObject();
            obj.notes = apt._doc.notes;  // Include full notes
            return obj;
        });

        res.json({
            status: 'success',
            data: {
                appointments: appointmentsWithNotes,
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
            message: 'Failed to get appointments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Update appointment status
export const updateAppointmentStatus = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id } = req.params;
        const { status, cancellationReason, moodAfter, rating, feedback } = req.body;
        const userId = req.user._id;

        const appointment = await Appointment.findById(id)
            .populate('therapistId')
            .session(session);

        if (!appointment) {
            await session.abortTransaction();
            session.endSession();
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }

        // Check authorization (user or therapist)
        const therapist = await Therapist.findOne({ userId }).session(session);
        const isTherapist = therapist && therapist._id.equals(appointment.therapistId._id);
        const isUser = appointment.userId.equals(userId);

        if (!isUser && !isTherapist) {
            await session.abortTransaction();
            session.endSession();
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        // Update based on new status
        const updates = { status };

        if (status === 'cancelled') {
            updates.cancelledAt = new Date();
            updates.cancelledBy = isTherapist ? 'therapist' : 'user';
            updates.cancellationReason = cancellationReason;
        }

        if (status === 'completed') {
            if (moodAfter) updates.moodAfter = moodAfter;
            if (rating) updates.rating = rating;
            if (feedback) updates.feedback = feedback;

            // Update therapist stats
            await Therapist.findByIdAndUpdate(
                appointment.therapistId._id,
                { $inc: { completedSessions: 1 } },
                { session }
            );

            // Update PalScore for user (therapy session completion)
            if (isUser && appointment.moodBefore && moodAfter) {
                await updateScore(userId, {
                    type: 'therapy-session',
                    _id: appointment._id,
                    moodImprovement: moodAfter > appointment.moodBefore,
                    duration: appointment.duration
                });
            }
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true, session }
        );

        await session.commitTransaction();
        session.endSession();

        res.json({
            status: 'success',
            message: `Appointment ${status}`,
            data: updatedAppointment
        });
    } catch (error) {
        await session.abortTransaction();
        session.endSession();
        res.status(500).json({
            status: 'error',
            message: 'Failed to update appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Add session notes
export const addSessionNotes = async (req, res) => {
    try {
        const { id } = req.params;
        const { preMeeting, postMeeting, therapistNotes, summary } = req.body;
        const userId = req.user._id;

        const appointment = await Appointment.findById(id);
        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const therapist = await Therapist.findOne({ userId });
        const isTherapist = therapist && therapist._id.equals(appointment.therapistId);
        const isUser = appointment.userId.equals(userId);

        if (!isUser && !isTherapist) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        const updates = {};

        // Users can update preMeeting and postMeeting notes
        if (isUser) {
            if (preMeeting) updates['notes.preMeeting'] = preMeeting;
            if (postMeeting) updates['notes.postMeeting'] = postMeeting;
        }

        // Therapists can update all notes
        if (isTherapist) {
            if (therapistNotes) updates['notes.therapistNotes'] = therapistNotes;
            if (summary) updates['notes.summary'] = summary;
        }

        const updatedAppointment = await Appointment.findByIdAndUpdate(
            id,
            { $set: updates },
            { new: true }
        );

        res.json({
            status: 'success',
            message: 'Notes updated successfully',
            data: isTherapist ? updatedAppointment : {
                ...updatedAppointment.toObject(),
                notes: {
                    preMeeting: updatedAppointment.notes.preMeeting,
                    postMeeting: updatedAppointment.notes.postMeeting,
                    summary: updatedAppointment.notes.summary
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update notes',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Get single appointment
export const getAppointment = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const appointment = await Appointment.findById(id)
            .populate({
                path: 'therapistId',
                select: 'professionalInfo bio profilePicture rating availability',
                populate: {
                    path: 'userId',
                    select: 'username profile.displayName'
                }
            })
            .populate('userId', 'username profile.displayName');

        if (!appointment) {
            return res.status(404).json({
                status: 'error',
                message: 'Appointment not found'
            });
        }

        // Check authorization
        const therapist = await Therapist.findOne({ userId });
        const isTherapist = therapist && therapist._id.equals(appointment.therapistId._id);
        const isUser = appointment.userId._id.equals(userId);

        if (!isUser && !isTherapist) {
            return res.status(403).json({
                status: 'error',
                message: 'Unauthorized'
            });
        }

        res.json({
            status: 'success',
            data: appointment
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to get appointment',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};
