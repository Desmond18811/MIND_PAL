import axios from 'axios';
import User from '../models/User.js';

const WEARABLE_SERVICES = {
    fitbit: {
        authUrl: 'https://www.fitbit.com/oauth2/authorize',
        tokenUrl: 'https://api.fitbit.com/oauth2/token',
        apiUrl: 'https://api.fitbit.com/1/user/-'
    },
    appleHealth: {
        authUrl: 'https://appleid.apple.com/auth/authorize',
        tokenUrl: 'https://appleid.apple.com/auth/token'
    }
};

// Connect user's wearable account
export const connectWearable = async (userId, service, authCode) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const config = WEARABLE_SERVICES[service];
        if (!config) throw new Error('Unsupported wearable service');

        // Exchange auth code for tokens
        const tokenResponse = await axios.post(config.tokenUrl, new URLSearchParams({
            code: authCode,
            grant_type: 'authorization_code',
            client_id: process.env[`${service.toUpperCase()}_CLIENT_ID`],
            client_secret: process.env[`${service.toUpperCase()}_CLIENT_SECRET`]
        }), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        });

        // Save tokens to user
        user.wearableCredentials = user.wearableCredentials || {};
        user.wearableCredentials[service] = {
            accessToken: tokenResponse.data.access_token,
            refreshToken: tokenResponse.data.refresh_token,
            expiresAt: Date.now() + (tokenResponse.data.expires_in * 1000)
        };

        await user.save();

        return { success: true };
    } catch (error) {
        console.error('Error connecting wearable:', error);
        throw error;
    }
};

// Get health data from wearable
export const getHealthData = async (userId, service, date = new Date()) => {
    try {
        const user = await User.findById(userId);
        if (!user) throw new Error('User not found');

        const credentials = user.wearableCredentials?.[service];
        if (!credentials) throw new Error('Service not connected');

        // Refresh token if expired
        if (credentials.expiresAt < Date.now()) {
            await refreshWearableToken(userId, service);
        }

        const config = WEARABLE_SERVICES[service];
        const dateStr = date.toISOString().split('T')[0];

        let healthData = {};

        if (service === 'fitbit') {
            // Get sleep data
            const sleepRes = await axios.get(`${config.apiUrl}/sleep/date/${dateStr}.json`, {
                headers: {
                    'Authorization': `Bearer ${credentials.accessToken}`
                }
            });

            // Get activity data
            const activityRes = await axios.get(`${config.apiUrl}/activities/date/${dateStr}.json`, {
                headers: {
                    'Authorization': `Bearer ${credentials.accessToken}`
                }
            });

            healthData = {
                sleep: sleepRes.data.sleep,
                activity: activityRes.data.activities
            };
        }

        return healthData;
    } catch (error) {
        console.error('Error fetching health data:', error);
        throw error;
    }
};