const{ createClient } = require( 'redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
        host: 'redis-14911.c277.us-east-1-3.ec2.redns.redis-cloud.com',
        port: 14911
    }
});

module.exports = redisClient;