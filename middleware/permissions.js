import User from '../models/User.js';

/**
 * Middleware to restrict access to admin users only
 */
export const adminOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || user.role !== 'admin') {
            return res.status(403).json({
                status: 'error',
                message: 'Admin access required'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error verifying permissions',
            error: error.message
        });
    }
};

/**
 * Middleware to check if user has premium subscription
 */
export const premiumOnly = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        if (!user || !user.subscription?.isPremium) {
            return res.status(403).json({
                status: 'error',
                message: 'Premium subscription required'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error verifying subscription',
            error: error.message
        });
    }
};

/**
 * Middleware to check resource ownership
 */
export const ownerOrAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id);

        // Allow if admin
        if (user.role === 'admin') return next();

        // Check ownership
        if (req.params.userId && req.params.userId !== req.user._id.toString()) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only access your own resources'
            });
        }

        next();
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Error verifying ownership',
            error: error.message
        });
    }
};