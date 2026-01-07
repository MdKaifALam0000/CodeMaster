# Gemini API Quota Management & Error Handling

## Problem Overview
The Gemini API free tier has strict rate limits that can be easily exceeded:
- **15 requests per minute (RPM)**
- **1 million tokens per minute (TPM)**
- **1,500 requests per day (RPD)**

When these limits are exceeded, you receive a `429 RESOURCE_EXHAUSTED` error.

## Solution Implemented

### 1. Rate Limiting Middleware (`src/middleware/rateLimiter.js`)

We've implemented three layers of rate limiting:

#### a) **Per-Minute AI Rate Limiter**
- **Limit**: 10 requests per minute per user
- **Purpose**: Prevents hitting the 15 RPM Gemini limit
- **Applied to**: `/api/ai/chat` endpoint

```javascript
const aiRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 10,
    // ... configuration
});
```

#### b) **Code Review Rate Limiter**
- **Limit**: 5 requests per minute per user
- **Purpose**: Code reviews consume more tokens, so stricter limits
- **Applied to**: `/api/ai/review` endpoint

```javascript
const codeReviewRateLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 5,
    // ... configuration
});
```

#### c) **Daily Rate Limiter**
- **Limit**: 100 requests per day per user
- **Purpose**: Prevents exhausting the 1,500 RPD quota
- **Applied to**: All AI routes

```javascript
const dailyAiLimiter = rateLimit({
    windowMs: 24 * 60 * 60 * 1000,
    max: 100,
    // ... configuration
});
```

### 2. Enhanced Error Handling

Both `codeReview.js` and `solveDoubt.js` controllers now include:

#### Detailed 429 Error Response
```json
{
  "success": false,
  "error": "Gemini API quota exceeded",
  "message": "The AI service has reached its usage limit...",
  "retryAfter": 46,
  "retryAfterFormatted": "46 second(s)",
  "quotaExceeded": true,
  "tier": "free",
  "suggestion": "Consider upgrading to a paid plan or wait for quota reset.",
  "tips": [
    "Wait a few moments before trying again",
    "Try reviewing smaller code snippets",
    "Consider using the service during off-peak hours"
  ]
}
```

#### Features:
- **Automatic retry delay extraction** from Gemini error messages
- **Quota information parsing** (free tier vs paid tier)
- **User-friendly error messages** with actionable tips
- **Formatted retry times** (seconds/minutes)

### 3. Route Configuration

Updated `src/routes/aiChatting.js`:
```javascript
// Apply daily limiter to all AI routes
aiRouter.use(dailyAiLimiter);

// Chat endpoint with general AI rate limiter
aiRouter.post('/chat', userMiddleware, aiRateLimiter, solveDoubt);

// Code review with stricter rate limiter
aiRouter.post('/review', userMiddleware, codeReviewRateLimiter, reviewCode);
```

## How It Works

### Request Flow:
1. **User makes request** → `/api/ai/review`
2. **Authentication** → `userMiddleware` validates user
3. **Daily limit check** → `dailyAiLimiter` (100/day)
4. **Per-minute limit check** → `codeReviewRateLimiter` (5/min)
5. **Controller execution** → `reviewCode` controller
6. **Gemini API call** → If quota exceeded, detailed error returned

### Rate Limit Headers:
Clients receive helpful headers:
```
RateLimit-Limit: 5
RateLimit-Remaining: 4
RateLimit-Reset: 1699564800
```

### Error Handling Hierarchy:
```
Rate Limiter (429) → Prevents request
    ↓ (if passed)
Gemini API Call
    ↓ (if 429)
Enhanced Error Handler → Detailed response with retry info
```

## Benefits

### 1. **Prevents Quota Exhaustion**
- Proactive rate limiting before hitting Gemini limits
- Per-user tracking prevents one user from exhausting quota

### 2. **Better User Experience**
- Clear error messages explaining what happened
- Specific retry times instead of generic "try again later"
- Helpful tips for avoiding future issues

### 3. **Cost Management**
- Prevents accidental quota overuse
- Protects against potential API costs if upgraded to paid tier

### 4. **Scalability**
- Per-user limits ensure fair usage
- Daily limits prevent long-term quota issues

## Configuration

### Adjusting Rate Limits

Edit `src/middleware/rateLimiter.js`:

```javascript
// For more lenient limits:
max: 15,  // Increase from 10

// For stricter limits:
max: 3,   // Decrease from 5

// For different time windows:
windowMs: 5 * 60 * 1000,  // 5 minutes instead of 1
```

### Environment Variables

Ensure `.env` has:
```env
GEMINI_API_KEY=your_api_key_here
NODE_ENV=production  # or 'development' for detailed errors
```

## Monitoring & Debugging

### Check Rate Limit Status
Monitor these logs:
```bash
# Rate limit exceeded
Rate limit exceeded for user: user_123abc

# Gemini quota exceeded
Gemini API Error: ApiError: {"error":{"code":429,...}}
```

### Frontend Integration

Handle errors in your frontend:
```javascript
try {
  const response = await fetch('/api/ai/review', {
    method: 'POST',
    body: JSON.stringify({ code, language })
  });
  
  const data = await response.json();
  
  if (response.status === 429) {
    // Show retry timer: data.retryAfterFormatted
    showError(`Please wait ${data.retryAfterFormatted} before trying again`);
  }
} catch (error) {
  console.error(error);
}
```

## Future Enhancements

### 1. **Redis-based Rate Limiting**
For distributed systems:
```javascript
const RedisStore = require('rate-limit-redis');
const limiter = rateLimit({
  store: new RedisStore({
    client: redisClient
  })
});
```

### 2. **Usage Analytics**
Track API usage per user:
- Daily/weekly/monthly reports
- Cost projections
- User behavior patterns

### 3. **Dynamic Rate Limiting**
Adjust limits based on:
- User subscription tier
- Time of day
- Overall system load

### 4. **Fallback Mechanisms**
- Queue requests during high load
- Implement request prioritization
- Add caching for common queries

## Troubleshooting

### Issue: Still getting 429 errors
**Solution**: Reduce rate limits further or check if multiple instances are running

### Issue: Rate limits too strict
**Solution**: Increase `max` values in `rateLimiter.js`

### Issue: Users complaining about wait times
**Solution**: Implement request queuing or upgrade to paid Gemini tier

## API Upgrade Path

When ready to upgrade from free tier:

1. **Gemini Pro Tier**
   - 360 RPM (24x increase)
   - 4M TPM (4x increase)
   - 10,000 RPD (6.6x increase)

2. **Update Rate Limits**
   ```javascript
   max: 50,  // Increase limits
   windowMs: 60 * 1000
   ```

3. **Monitor Costs**
   - Track token usage
   - Set up billing alerts
   - Implement cost attribution per user

## Summary

This implementation provides:
- ✅ **Proactive rate limiting** to prevent quota exhaustion
- ✅ **Detailed error messages** with retry information
- ✅ **Per-user fairness** through individual rate limits
- ✅ **Scalable architecture** ready for growth
- ✅ **Better UX** with clear feedback and guidance

The system now gracefully handles quota limits while providing users with clear, actionable feedback.
