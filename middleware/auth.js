// middleware/auth.js
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const authenticate = async (req, res, next) => {
    try {
        // 1. Get token from header
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                status: 'error',
                message: 'Authentication required'
            });
        }

        // 2. Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Find user
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                status: 'error',
                message: 'User not found'
            });
        }

        // 4. Attach user to request
        req.user = user;
        next();
    } catch (err) {
        res.status(401).json({
            status: 'error',
            message: 'Invalid token'
        });
    }
};

export default authenticate;