const express = require('express');
const userMiddleware = require('../middleware/userMiddleware');
const solveDoubt = require('../controllers/solveDoubt');
const reviewCode = require('../controllers/codeReview');
const generateAlgorithmAnimation = require('../controllers/algorithmAnimation');
const { aiRateLimiter, codeReviewRateLimiter, dailyAiLimiter } = require('../middleware/rateLimiter');

const aiRouter = express.Router();

// Apply daily rate limiter to all AI routes
aiRouter.use(dailyAiLimiter);

// Chat endpoint with general AI rate limiter
aiRouter.post('/chat', userMiddleware, aiRateLimiter, solveDoubt);

// Code review endpoint with stricter rate limiter (consumes more tokens)
aiRouter.post('/review', userMiddleware, codeReviewRateLimiter, reviewCode);

const progressAnalysis = require('../controllers/progressAnalysis');

// Algorithm animation endpoint - generates visual animation pipeline
aiRouter.post('/animate', userMiddleware, aiRateLimiter, generateAlgorithmAnimation);

// Progress Analysis endpoint
aiRouter.post('/analyze-progress', userMiddleware, aiRateLimiter, progressAnalysis);

module.exports = aiRouter;

