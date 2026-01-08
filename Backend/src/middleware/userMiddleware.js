const jwt = require('jsonwebtoken');
const User = require('../models/user');
const redisClient = require('../config/redis');


const userMiddleware = async (req, res, next) => {
    try {
        let { token } = req.cookies;

        // If no cookie, check Authorization header directly
        if (!token && req.headers.authorization) {
            const authHeader = req.headers.authorization;
            if (authHeader.startsWith('Bearer ')) {
                token = authHeader.substring(7);
            }
        }

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

        //Redis ke blocklist mein present hain ki nahi
        const isBlocked = await redisClient.get(`token:${token}`);

        //if present then we will throw an error
        if (isBlocked) {
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