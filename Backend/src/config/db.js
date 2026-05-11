const mongoose = require('mongoose')

async function main(){
    await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 10000, // Fail fast on cold start (10s)
        connectTimeoutMS: 10000,         // TCP connect timeout
        socketTimeoutMS: 45000,          // How long a socket stays open idle
        maxPoolSize: 5,                  // Keep pool small for free-tier RAM
    });
}

module.exports = main;