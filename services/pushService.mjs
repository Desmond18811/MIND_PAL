import User from '../models/User.mjs';
import axios from 'axios';
import mongoose from 'mongoose';

// Expo Push Notification configuration
const EXPO_API_URL = 'https://exp.host/--/api/v2/push/send';
const EXPO_ACCESS_TOKEN = process.env.EXPO_ACCESS_TOKEN;

/**
 * Send push notification to user
 * @param {string} userId - User ID to send notification to
 * @param {string} title - Notification title
 * @param {string} body - Notification body
 * @param {object} data - Additional data payload
 */
export const sendPushNotification = async (userId, title, body, data = {}) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        // Get user's push tokens
        const user = await User.findById(userId)
            .select('pushTokens')
            .session(session);

        if (!user || !user.pushTokens || user.pushTokens.length === 0) {
            await session.abortTransaction();
            session.endSession();
            return { sent: false, message: 'No push tokens available' };
        }

        // Prepare notifications for all devices
        const notifications = user.pushTokens.map(token => ({
            to: token,
            title,
            body,
            data,
            sound: 'default',
            channelId: 'meditation-reminders'
        }));

        // Send to Expo push service
        const response = await axios.post(EXPO_API_URL, notifications, {
            headers: {
                'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Check for errors
        const receipts = response.data.data;
        const failedTokens = [];

        receipts.forEach((receipt, index) => {
            if (receipt.status === 'error') {
                failedTokens.push(user.pushTokens[index]);
            }
        });

        // Remove failed tokens
        if (failedTokens.length > 0) {
            await User.findByIdAndUpdate(
                userId,
                {
                    $pull: {
                        pushTokens: { $in: failedTokens }
                    }
                },
                { session }
            );
        }

        await session.commitTransaction();
        session.endSession();

        return {
            sent: true,
            sentCount: receipts.length - failedTokens.length,
            failedCount: failedTokens.length
        };
    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        console.error('Error sending push notification:', error);
        throw error;
    }
};

/**
 * Save push token for user
 * @param {string} userId - User ID
 * @param {string} token - Expo push token
 */
export const savePushToken = async (userId, token) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    pushTokens: token
                }
            }
        );

        return { success: true };
    } catch (error) {
        console.error('Error saving push token:', error);
        throw error;
    }
};

/**
 * Process push notification receipts
 * @param {array} receiptIds - Array of receipt IDs to check
 */
export const checkPushReceipts = async (receiptIds) => {
    try {
        const response = await axios.post('https://exp.host/--/api/v2/push/getReceipts', {
            ids: receiptIds
        }, {
            headers: {
                'Authorization': `Bearer ${EXPO_ACCESS_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        // Handle errors (e.g., remove invalid tokens)
        const receipts = response.data.data;
        const errors = [];

        for (const [receiptId, receipt] of Object.entries(receipts)) {
            if (receipt.status === 'error') {
                errors.push({
                    receiptId,
                    error: receipt.details?.error,
                    token: receipt.details?.expoPushToken
                });

                // Remove invalid token from user
                if (receipt.details?.expoPushToken) {
                    await User.updateMany(
                        { pushTokens: receipt.details.expoPushToken },
                        { $pull: { pushTokens: receipt.details.expoPushToken } }
                    );
                }
            }
        }

        return {
            success: true,
            checked: receiptIds.length,
            errors
        };
    } catch (error) {
        console.error('Error checking push receipts:', error);
        throw error;
    }
};