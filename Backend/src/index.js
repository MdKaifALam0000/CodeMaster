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
const corsOptions = {
    origin: process.env.NODE_ENV === 'production'
        ? 'https://codemaster-frontend.onrender.com'
        : ['http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

console.log('🔒 CORS Options:', {
    NODE_ENV: process.env.NODE_ENV,
    origins: corsOptions.origin
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
app.use('/submission', submitRouter);
app.use('/ai', aiRouter);
app.use('/video', videoRouter);
app.use('/dashboard', dashboardRouter);
app.use('/team', teamCodingRouter);


// Initialize DB & Redis, then start server
const initializeConnection = async () => {
    try {
        await Promise.all([main(), redisClient.connect()]);
        console.log("✅ MongoDB and Redis connected successfully!");

        // Initialize Socket.IO handlers
        require('./socket/teamCodingSocket')(io);

        httpServer.listen(process.env.PORT || 3000, () => {
            console.log(`🚀 Server is running on port ${process.env.PORT || 3000}`);
            console.log(`🔌 Socket.IO server is ready at http://localhost:${process.env.PORT || 3000}`);
            console.log(`✅ Backend URL: http://localhost:${process.env.PORT || 3000}`);
        });
    } catch (err) {
        console.error('❌ Error connecting to the database or Redis:', err);
        process.exit(1);
    }
};

initializeConnection();
