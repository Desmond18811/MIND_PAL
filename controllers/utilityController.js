import ErrorLog from '../models/ErrorLog.js';
import mongoose from "mongoose";

// Log an error
export const logError = async (req, res) => {
    try {
        const { code, message, path, method, stack, metadata } = req.body;
        const userId = req.user?._id;
        const ipAddress = req.ip;
        const userAgent = req.get('User-Agent');

        const error = await ErrorLog.create({
            userId,
            code,
            message,
            path,
            method,
            stack,
            ipAddress,
            userAgent,
            metadata
        });

        // Here you would add any error notification logic
        // e.g., send to Slack, email admins, etc.

        res.status(201).json(error);
    } catch (error) {
        console.error('Failed to log error:', error);
        res.status(500).json({ error: 'Failed to log error' });
    }
};

// Get maintenance status
export const getMaintenanceStatus = async (req, res) => {
    try {
        // In a real app, this would check a database or config file
        const maintenanceStatus = {
            active: false,
            message: 'System operating normally',
            estimatedRestoration: null
        };

        res.json(maintenanceStatus);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get error suggestions
export const getErrorSuggestions = async (req, res) => {
    try {
        const { code } = req.query;

        // This would typically come from a knowledge base
        const suggestions = {
            '404': {
                title: 'Page Not Found',
                suggestions: [
                    'Check the URL for typos',
                    'Navigate back to the homepage',
                    'Search for what you were looking for'
                ],
                action: { text: 'Go to Home', url: '/' }
            },
            '500': {
                title: 'Server Error',
                suggestions: [
                    'Try refreshing the page',
                    'Wait a few minutes and try again',
                    'Contact support if the problem persists'
                ],
                action: { text: 'Refresh', url: null }
            },
            'offline': {
                title: 'No Internet Connection',
                suggestions: [
                    'Check your network connection',
                    'Try turning WiFi off and on',
                    'Restart your device'
                ],
                action: { text: 'Retry', url: null }
            }
        };

        const result = suggestions[code] || {
            title: 'Unknown Error',
            suggestions: [
                'Try refreshing the page',
                'Contact support if the problem persists'
            ],
            action: { text: 'Go to Home', url: '/' }
        };

        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Health check endpoint
export const healthCheck = async (req, res) => {
    try {
        // Check database connection
        await mongoose.connection.db.admin().ping();

        res.json({
            status: 'healthy',
            timestamp: new Date(),
            uptime: process.uptime(),
            database: 'connected',
            memoryUsage: process.memoryUsage()
        });
    } catch (error) {
        res.status(503).json({
            status: 'unhealthy',
            error: error.message,
            database: 'disconnected'
        });
    }
};