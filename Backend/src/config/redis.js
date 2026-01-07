const{ createClient } = require( 'redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-16281.c8.us-east-1-4.ec2.cloud.redislabs.com',
        port: 16281
    }
});

module.exports = redisClient;