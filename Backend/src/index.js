const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const app = express();
const httpServer = createServer(app);
require('dotenv').config();
const main = require('./config/db'); // should export a function
const cookieParser = require('cookie-parser');
const authrouter = require("./routes/userAuth");
const redisClient = require('./config/redis');
const problemRouter = require('./routes/problemCreator');
const submitRouter = require('./routes/submit')
const cors = require('cors');
const aiRouter = require('./routes/aiChatting');
const videoRouter = require('./routes/videoCreator');
const dashboardRouter = require('./routes/userProfile');
const teamCodingRouter = require('./routes/teamCoding');



//the browser protect the frontend to get connected with backedn because both are running at different port so to connect them we want a verfication that's why we use cors 
//import cors -> and read the cors documentation
// CORS configuration
// Strip trailing slash from FRONTEND_URL — browsers send origins WITHOUT trailing slash
const productionOrigin = process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.replace(/\/$/, '')
    : null;

const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? productionOrigin
        : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

console.log('🔒 CORS Options:', {
    NODE_ENV: process.env.NODE_ENV,
    FRONTEND_URL_raw: process.env.FRONTEND_URL,
    origin_used: corsOptions.origin
});

app.use(cors(corsOptions));

// Socket.IO with CORS
const io = new Server(httpServer, {
    cors: corsOptions,
    pingInterval: 25000,
    pingTimeout: 20000
});

console.log('🔌 Socket.IO initialized with CORS:', corsOptions.origin);

// Middleware
app.use(express.json());
app.use(cookieParser());

// Routes
app.use('/user', authrouter);
app.use('/problem', problemRouter);
app.use('/submission' , submitRouter);
app.use('/ai' , aiRouter);
app.use('/video' , videoRouter);
app.use('/dashboard', dashboardRouter);
app.use('/team', teamCodingRouter);


// Initialize Socket.IO handlers
require('./socket/teamCodingSocket')(io);

// Start server immediately to bind port quickly during cold starts on Vercel/Render
httpServer.listen(process.env.PORT || 3000, () => {
    console.log(` Server is running on port ${process.env.PORT || 3000}`);
    console.log(` Socket.IO server is ready at http://localhost:${process.env.PORT || 3000}`);
    console.log(` Backend URL: http://localhost:${process.env.PORT || 3000}`);
});

// Initialize DB & Redis asynchronously
const initializeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("✅ MongoDB and Redis connected successfully!");
    } catch (err) {
        console.error(' Error connecting to the database or Redis:', err);
    }
};

// Health check endpoint — Render uses this to confirm the service is up
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

initializeConnection();

// Keep-alive self-ping — prevents Render free/starter tier from spinning down
// Render spins down idle services after ~15 min, causing 30-90s cold starts
if (process.env.NODE_ENV === 'production') {
    const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 3000}`;
    const PING_INTERVAL_MS = 14 * 60 * 1000; // 14 minutes

    setInterval(async () => {
        try {
            const axios = require('axios');
            await axios.get(`${SELF_URL}/health`, { timeout: 10000 });
            console.log(`♻️  Keep-alive ping sent to ${SELF_URL}/health`);
        } catch (err) {
            console.warn('⚠️  Keep-alive ping failed:', err.message);
        }
    }, PING_INTERVAL_MS);

    console.log(`♻️  Keep-alive self-ping active (every 14 min) → ${SELF_URL}/health`);
}

