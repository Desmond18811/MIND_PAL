import express from 'express';
import {
    logError,
    getMaintenanceStatus,
    getErrorSuggestions,
    healthCheck
} from '../controllers/utilityController.js';

const router = express.Router();

// Error handling
router.post('/errors', logError);
router.get('/errors/suggestions', getErrorSuggestions);

// System status
router.get('/maintenance', getMaintenanceStatus);
router.get('/health', healthCheck);

export default router;