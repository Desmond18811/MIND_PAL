import User from '../models/User.mjs';
import MeditationReminder from '../models/MeditationReminder.mjs';
import { sendPushNotification } from './pushService.mjs';

// Send meditation reminders
export const sendMeditationReminders = async () => {
    try {
        const now = new Date();
        const currentHour = now.getHours();

        // Get users with reminders set for this hour
        const reminders = await MeditationReminder.find({
            hour: currentHour,
            isActive: true
        }).populate('userId');

        for (const reminder of reminders) {
            // Check if user already meditated today
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const hasMeditated = await MeditationSession.exists({
                userId: reminder.userId._id,
                startTime: { $gte: today }
            });

            if (!hasMeditated) {
                await sendPushNotification(
                    reminder.userId._id,
                    'MindPal Reminder',
                    reminder.customMessage || 'Time for your daily meditation session!'
                );

                // Log the reminder
                reminder.lastSent = new Date();
                await reminder.save();
            }
        }
    } catch (error) {
        console.error('Error sending meditation reminders:', error);
    }
};

// Schedule reminders (run this on server startup)
export const scheduleReminders = () => {
    // Run every hour at :00
    setInterval(sendMeditationReminders, 60 * 60 * 1000);

    // Also run immediately on startup
    sendMeditationReminders();
};