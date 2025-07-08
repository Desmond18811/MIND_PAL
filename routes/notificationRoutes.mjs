import express from 'express';
import {
    createNotification,
    getNotifications,
    markAsRead,
    deleteNotification,
    getNotificationStats
} from '../controllers/notificationController.mjs';
import authenticate from '../middleware/auth.mjs';

const router = express.Router();
router.use(authenticate);

// Notification CRUD operations
router.post('/', createNotification);
router.get('/', getNotifications);
router.patch('/:id/read', markAsRead);
router.delete('/:id', deleteNotification);

// Analytics
router.get('/stats', getNotificationStats);

export default router;