import express from 'express';
import {
    bookAppointment,
    getAppointments,
    getTherapistAppointments,
    updateAppointmentStatus,
    addSessionNotes,
    getAppointment
} from '../controllers/appointmentController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// User appointment routes
router.post('/', bookAppointment);                         // Book new appointment
router.get('/', getAppointments);                          // Get user's appointments
router.get('/:id', getAppointment);                        // Get single appointment

// Therapist appointment routes
router.get('/therapist/list', getTherapistAppointments);   // Get therapist's appointments

// Shared routes (both user and therapist)
router.put('/:id', updateAppointmentStatus);               // Update status (confirm, cancel, complete)
router.post('/:id/notes', addSessionNotes);                // Add session notes

export default router;
