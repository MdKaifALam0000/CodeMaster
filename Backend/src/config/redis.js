const { createClient } = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: process.env.REDIS_HOST || 'redis-12084.crce295.us-east-1-1.ec2.cloud.redislabs.com',
        port: parseInt(process.env.REDIS_PORT) || 12084
    }
});

// Prevent unhandled error from crashing the server
redisClient.on('error', (err) => console.error('Redis Client Error:', err));

module.exports = redisClient;