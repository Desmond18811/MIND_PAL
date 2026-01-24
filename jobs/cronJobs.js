/**
 * Cron Jobs - Scheduled analysis and insight generation
 */

import cron from 'node-cron';
import User from '../models/User.js';
import DataPermission from '../models/DataPermission.js';
import Notification from '../models/Notification.js';
import { generateComprehensiveInsights } from '../services/analysisService.js';
import { updateUserPatterns } from '../services/userLearningService.js';

/**
 * Initialize all cron jobs
 */
export function initializeCronJobs() {
    console.log('🕐 Initializing cron jobs...');

    // Daily analysis at 6 AM
    cron.schedule('0 6 * * *', async () => {
        console.log('📊 Running daily analysis job...');
        await runDailyAnalysis();
    });

    // Weekly insights every Sunday at 10 AM
    cron.schedule('0 10 * * 0', async () => {
        console.log('📈 Running weekly insights job...');
        await runWeeklyInsights();
    });

    // Reminder to log mood every evening at 8 PM
    cron.schedule('0 20 * * *', async () => {
        console.log('🔔 Sending evening reminders...');
        await sendEveningReminders();
    });

    // Deep Learning / Pattern Update (ML) - Run nightly at 2 AM
    // This updates the long-term memory of the agent with new clusters/patterns
    cron.schedule('0 2 * * *', async () => {
        console.log('🧠 Running nightly ML pattern update...');
        await runPatternUpdates();
    });

    console.log('✅ Cron jobs initialized');
}

/**
 * Run nightly pattern updates for all active users
 */
async function runPatternUpdates() {
    try {
        // Find users with recent activity (active in last 7 days)
        const activeStart = new Date();
        activeStart.setDate(activeStart.getDate() - 7);

        // This query assumes we track lastLogin or similar, using generic approach for now
        const permissions = await DataPermission.find({}).lean();

        console.log(`Updating ML patterns for ${permissions.length} users...`);

        for (const p of permissions) {
            try {
                await updateUserPatterns(p.userId);
            } catch (err) {
                console.error(`Pattern update failed for ${p.userId}:`, err.message);
            }
        }
    } catch (error) {
        console.error('Nightly ML update failed:', error);
    }
}

/**
 * Run daily analysis for users who have granted permissions
 */
async function runDailyAnalysis() {
    try {
        const permissions = await DataPermission.find({
            $or: [
                { 'permissions.analyzeMood': true },
                { 'permissions.analyzeSleepData': true },
                { 'permissions.analyzeJournals': true }
            ]
        }).lean();

        console.log(`Processing ${permissions.length} users for daily analysis`);

        for (const permission of permissions) {
            try {
                const insights = await generateComprehensiveInsights(permission.userId);

                if (insights.success && insights.data) {
                    // Check for urgent warnings from ML
                    if (insights.data.moodAnalysis?.warning) {
                        await createInsightNotification(permission.userId, 'alert', insights.data);
                    } else {
                        await createInsightNotification(permission.userId, 'daily', insights.data);
                    }
                }
            } catch (error) {
                console.error(`Analysis failed for user ${permission.userId}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Daily analysis job failed:', error);
    }
}

/**
 * Run weekly insights for all active users
 */
async function runWeeklyInsights() {
    try {
        const permissions = await DataPermission.find({
            revokedAll: { $ne: true }
        }).lean();

        console.log(`Processing ${permissions.length} users for weekly insights`);

        for (const permission of permissions) {
            try {
                const hasAnyPermission = Object.values(permission.permissions).some(p => p);

                if (hasAnyPermission) {
                    const insights = await generateComprehensiveInsights(permission.userId);

                    if (insights.success && insights.data) {
                        await createInsightNotification(permission.userId, 'weekly', insights.data);
                    }
                }
            } catch (error) {
                console.error(`Weekly insights failed for user ${permission.userId}:`, error.message);
            }
        }
    } catch (error) {
        console.error('Weekly insights job failed:', error);
    }
}

/**
 * Send evening reminders to log mood
 */
async function sendEveningReminders() {
    try {
        const users = await User.find({
            'preferences.notificationFrequency': 'daily'
        }).select('_id profile.displayName').lean();

        for (const user of users) {
            const notification = new Notification({
                userId: user._id,
                type: 'reminder',
                title: 'Evening Check-in',
                message: `Hi${user.profile?.displayName ? ` ${user.profile.displayName}` : ''}! How was your day? Take a moment to log your mood and reflect.`,
                priority: 'low',
                action: { type: 'navigate', destination: '/mood/log' }
            });
            await notification.save();
        }
    } catch (error) {
        console.error('Evening reminders job failed:', error);
    }
}

/**
 * Create a notification with insights
 */
async function createInsightNotification(userId, type, insights) {
    try {
        let message = '';
        let title = '';
        let priority = 'medium';

        if (type === 'alert') {
            title = '⚠️ Mood Trend Alert';
            message = "I've noticed a declining trend in your mood recently. I'm here if you need support.";
            priority = 'high';
        } else if (type === 'daily') {
            title = '🌟 Daily Insight';
            // ... (keep existing logic)
            if (insights.moodAnalysis) {
                const avgMood = parseFloat(insights.moodAnalysis.averageMood);
                if (avgMood >= 7) message = "You've been feeling great lately! Keep up the positive momentum.";
                else if (avgMood >= 5) message = "You're doing okay. Remember to take care of yourself today.";
                else message = "It looks like you might be going through a tough time. I'm here if you want to talk.";
            } else {
                message = "Remember to log your mood today so I can provide better insights!";
            }
        } else if (type === 'weekly') {
            title = '📊 Weekly Summary';
            message = "Your weekly wellness report is ready.";
        }

        const notification = new Notification({
            userId,
            type: 'insight',
            title,
            message,
            priority,
            data: { insightType: type, generatedAt: new Date() },
            action: { type: 'navigate', destination: '/insights' }
        });

        await notification.save();
        return notification;
    } catch (error) {
        console.error('Failed to create insight notification:', error);
        return null;
    }
}

export default { initializeCronJobs };
