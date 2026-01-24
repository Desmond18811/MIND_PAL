/**
 * Appointment Routes - Therapy Session Management
 */

import express from 'express';
import authenticate from '../middleware/auth.js';
// Placeholder: Import Appointment model if creating one, or reuse logic
// For this implementation, we'll simulate the booking logic as the core model wasn't explicitly requested but routes were.

const router = express.Router();
router.use(authenticate);

/**
 * GET /api/appointments/slots
 * Get available appointment slots
 */
router.get('/slots', (req, res) => {
    // Mock data for available slots
    // In production, this would query a Therapist/Schedule model
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(9, 0, 0, 0);

    const slots = [
        { id: 'slot_1', time: new Date(tomorrow).toISOString(), therapist: 'Dr. Sarah Smith', specialization: 'Anxiety' },
        { id: 'slot_2', time: new Date(tomorrow.setHours(10)).toISOString(), therapist: 'Dr. Sarah Smith', specialization: 'Anxiety' },
        { id: 'slot_3', time: new Date(tomorrow.setHours(14)).toISOString(), therapist: 'Dr. James Wilson', specialization: 'Depression' }
    ];

    res.json({
        status: 'success',
        data: slots
    });
});

/**
 * POST /api/appointments/book
 * Book an appointment
 */
router.post('/book', (req, res) => {
    const { slotId, reason } = req.body;

    if (!slotId) {
        return res.status(400).json({ status: 'error', message: 'Slot ID required' });
    }

    // Mock booking confirmation
    res.status(201).json({
        status: 'success',
        message: 'Appointment booked successfully',
        data: {
            appointmentId: 'appt_' + Math.random().toString(36).substr(2, 9),
            userId: req.user.userId,
            slotId,
            status: 'confirmed',
            bookedAt: new Date()
        }
    });
});

/**
 * GET /api/appointments/my-appointments
 * Get user's booked appointments
 */
router.get('/my-appointments', (req, res) => {
    res.json({
        status: 'success',
        data: [
            {
                id: 'appt_123',
                therapist: 'Dr. Sarah Smith',
                time: new Date().toISOString(),
                status: 'upcoming'
            }
        ]
    });
});

export default router;
