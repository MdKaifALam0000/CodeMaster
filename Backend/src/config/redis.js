const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST || 'redis-12084.crce295.us-east-1-1.ec2.cloud.redislabs.com',
        port: parseInt(process.env.REDIS_PORT) || 12084,
        reconnectStrategy: (retries) => {
            if (retries > 5) {
                console.warn('⚠️ [Redis] Exceeded maximum reconnect attempts. Running in disconnected mode.');
                return false; // Stop reconnecting after 5 attempts to avoid log flood
            }
            return Math.min(retries * 500, 3000);
        }
    }
});

// Prevent unhandled error from crashing the server
redisClient.on('error', (err) => {
    // Graceful log, no unhandled exceptions
    console.warn('⚠️ [Redis Client Warning]:', err.message);
});

module.exports = redisClient;