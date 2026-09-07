const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');


const userMiddleware = async (req, res, next) => {
    try {
        const { token } = req.cookies;
        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication token is missing'
            });
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);
        const { _id } = payload;
        if (!_id) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token'
            });
        }

        const result = await User.findById(_id);
        if (!result) {
            return res.status(404).json({
                success: false,
                error: 'User not found'
            });
        }

        // Redis blocklist check (graceful if Redis is not connected)
        let isBlocked = null;
        if (redisClient.isOpen) {
            try {
                isBlocked = await redisClient.get(`token:${token}`);
            } catch (rErr) {
                console.warn('⚠️ [Middleware] Redis check failed:', rErr.message);
            }
        }

        console.log('🔍 [Middleware] Token Check:', {
            tokenId: _id,
            redisKey: `token:${token}`,
            isBlocked: isBlocked
        });

        // If present in blocklist, reject
        if (isBlocked) {
            console.error('🚫 [Middleware] Token Blocked by Redis');
            return res.status(401).json({
                success: false,
                error: 'Token is blocked or invalid'
            });
        }

        req.result = result;

        next();



    }
    catch (err) {
        console.error('Authentication error:', err);
        return res.status(401).json({
            success: false,
            error: err.message || 'Authentication failed'
        });
    }
}

module.exports = userMiddleware;