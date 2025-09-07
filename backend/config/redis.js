const { createClient }  = require('redis');

const redisClient = createClient({
    username: 'default',
    password: process.env.REDIS_PASS,
    socket: {
        host: 'redis-10382.c253.us-central1-1.gce.redns.redis-cloud.com',
        port: 10382
    }
});


module.exports = redisClient;