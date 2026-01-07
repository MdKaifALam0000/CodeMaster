const rateLimit = require('express-rate-limit');

// ================== GEMINI API RATE LIMITER ==================
// Purpose: Prevent quota exhaustion by limiting requests to Gemini API endpoints
// Gemini Free Tier Limits:
// - 15 requests per minute (RPM)
// - 1 million tokens per minute (TPM)
// - 1,500 requests per day (RPD)

/**
 * Rate limiter for AI-powered endpoints (code review, doubt solving)
 * Conservative limits to stay within Gemini free tier quotas
 */
const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 10, // Limit each user to 10 requests per minute (below 15 RPM limit)
    message: {
        success: false,
        error: 'Too many AI requests. Please wait a moment before trying again.',
        retryAfter: '1 minute'
    },
    standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
    legacyHeaders: false, // Disable `X-RateLimit-*` headers


    // Use user ID as key for per-user limiting
    keyGenerator: (req, res) => {
        // If user is authenticated, use their ID
        if (req.user && req.user._id) {
            return `user_${req.user._id}`;
        }
        // Fallback to IP address for unauthenticated requests
        return rateLimit.ipKeyGenerator(req, res);
    },

    // Custom handler for when limit is exceeded
    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Rate limit exceeded. You are making too many AI requests.',
            message: 'Please wait a minute before trying again. This helps us manage API costs and ensure service availability for all users.',
            retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now()) / 1000,
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining
        });
    },

    // Skip rate limiting for successful requests that don't hit the API
    skip: (req, res) => {
        // Skip if request validation fails (handled before API call)
        return false;
    }
});

/**
 * Stricter rate limiter for code review specifically
 * Code reviews consume more tokens, so we limit them more aggressively
 */
const codeReviewRateLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute window
    max: 5, // Limit to 5 code reviews per minute per user
    message: {
        success: false,
        error: 'Too many code review requests. Please wait before submitting another review.',
        retryAfter: '1 minute'
    },
    standardHeaders: true,
    legacyHeaders: false,


    keyGenerator: (req, res) => {
        if (req.user && req.user._id) {
            return `code_review_${req.user._id}`;
        }
        return `code_review_${rateLimit.ipKeyGenerator(req, res)}`;
    },

    handler: (req, res) => {
        res.status(429).json({
            success: false,
            error: 'Code review rate limit exceeded.',
            message: 'You can request up to 5 code reviews per minute. Please wait before submitting another review.',
            retryAfter: Math.ceil(req.rateLimit.resetTime - Date.now()) / 1000,
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining
        });
    }
});

/**
 * Daily rate limiter to prevent quota exhaustion over 24 hours
 * Gemini free tier: 1,500 requests per day
 */
const dailyAiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000, // 24 hours
    max: 100, // Limit each user to 100 AI requests per day
    message: {
        success: false,
        error: 'Daily AI request limit reached.',
        retryAfter: '24 hours'
    },
    standardHeaders: true,
    legacyHeaders: false,


    keyGenerator: (req, res) => {
        if (req.user && req.user._id) {
            return `daily_ai_${req.user._id}`;
        }
        return `daily_ai_${rateLimit.ipKeyGenerator(req, res)}`;
    },

    handler: (req, res) => {
        const resetTime = new Date(req.rateLimit.resetTime);
        res.status(429).json({
            success: false,
            error: 'Daily AI request limit reached.',
            message: 'You have reached your daily limit of 100 AI-powered requests. This limit resets at midnight UTC.',
            retryAfter: resetTime.toISOString(),
            limit: req.rateLimit.limit,
            remaining: req.rateLimit.remaining
        });
    }
});

module.exports = {
    aiRateLimiter,
    codeReviewRateLimiter,
    dailyAiLimiter
};
