const TeamRoom = require('../models/teamRoom');
const jwt = require('jsonwebtoken');

// ================== SOCKET.IO TEAM CODING HANDLER ==================

module.exports = (io) => {
    console.log('🔌 Socket.IO handlers initialized');
    
    // Global connection error handler
    io.on('connection_error', (error) => {
        console.error('❌ Global Socket.IO connection error:', {
            message: error.message,
            code: error.code,
            type: error.type
        });
    });
    
    // Middleware for Socket.IO authentication
    io.use(async (socket, next) => {
        console.log('🔐 Socket.IO authentication middleware called', {
            socketId: socket.id,
            hasAuth: !!socket.handshake.auth
        });
        
        try {
            const token = socket.handshake.auth.token;
            
            if (!token) {
                console.error('❌ No token provided in Socket.IO handshake for socket:', socket.id);
                return next(new Error('Authentication token required'));
            }

            try {
                const payload = jwt.verify(token, process.env.JWT_SECRET);
                socket.userId = payload._id;
                socket.user = payload;
                console.log(`✅ Socket authenticated for user: ${socket.userId}`, {
                    socketId: socket.id,
                    email: payload.email
                });
                next();
            } catch (jwtError) {
                console.error('❌ JWT verification failed:', {
                    message: jwtError.message,
                    socketId: socket.id,
                    code: jwtError.code
                });
                return next(new Error('Authentication failed: ' + jwtError.message));
            }
        } catch (err) {
            console.error('❌ Socket authentication error:', {
                message: err.message,
                socketId: socket.id
            });
            next(new Error('Authentication failed'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`👤 User connected: ${socket.userId}`, {
            socketId: socket.id,
            connectedClients: io.engine.clientsCount
        });

        // Join a team coding room
        socket.on('join-room', async ({ roomId, userData }) => {
            try {
                const room = await TeamRoom.findOne({ roomId })
                    .populate('participants.userId', 'firstName lastName profilePicture');

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                // Join Socket.IO room
                socket.join(roomId);
                socket.currentRoom = roomId;

                // Update participant status
                const participant = room.participants.find(
                    p => p.userId._id.toString() === socket.userId
                );

                if (participant) {
                    participant.isActive = true;
                    await room.save();
                }

                // Notify others in the room
                socket.to(roomId).emit('user-joined', {
                    userId: socket.userId,
                    userData,
                    timestamp: new Date()
                });

                // Send current room state to the joining user
                socket.emit('room-state', {
                    code: room.code,
                    language: room.language,
                    participants: room.participants,
                    chatHistory: room.chatHistory.slice(-50) // Last 50 messages
                });

                console.log(`✅ User ${socket.userId} joined room ${roomId}`);

            } catch (err) {
                console.error('Error joining room:', err);
                socket.emit('error', { message: 'Failed to join room' });
            }
        });

        // Handle code changes
        socket.on('code-change', async ({ roomId, code, cursorPosition }) => {
            try {
                const room = await TeamRoom.findOne({ roomId });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                // Update code in database
                room.code = code;
                
                // Add to code history (keep last 10 changes)
                room.codeHistory.push({
                    userId: socket.userId,
                    code,
                    timestamp: new Date()
                });

                if (room.codeHistory.length > 10) {
                    room.codeHistory = room.codeHistory.slice(-10);
                }

                await room.save();

                // Broadcast code change to all other users in the room
                socket.to(roomId).emit('code-update', {
                    code,
                    userId: socket.userId,
                    cursorPosition,
                    timestamp: new Date()
                });

            } catch (err) {
                console.error('Error updating code:', err);
                socket.emit('error', { message: 'Failed to update code' });
            }
        });

        // Handle cursor position updates
        socket.on('cursor-move', ({ roomId, position, selection }) => {
            socket.to(roomId).emit('cursor-update', {
                userId: socket.userId,
                position,
                selection,
                timestamp: new Date()
            });
        });

        // Handle language change
        socket.on('language-change', async ({ roomId, language }) => {
            try {
                const room = await TeamRoom.findOne({ roomId });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                // Only host can change language
                if (room.host.toString() !== socket.userId) {
                    socket.emit('error', { message: 'Only host can change language' });
                    return;
                }

                room.language = language;
                await room.save();

                // Broadcast language change to all users
                io.to(roomId).emit('language-updated', {
                    language,
                    timestamp: new Date()
                });

            } catch (err) {
                console.error('Error changing language:', err);
                socket.emit('error', { message: 'Failed to change language' });
            }
        });

        // Handle chat messages
        socket.on('send-message', async ({ roomId, message, username }) => {
            try {
                const room = await TeamRoom.findOne({ roomId });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                const chatMessage = {
                    userId: socket.userId,
                    username,
                    message,
                    timestamp: new Date()
                };

                // Add to chat history
                room.chatHistory.push(chatMessage);

                // Keep only last 100 messages
                if (room.chatHistory.length > 100) {
                    room.chatHistory = room.chatHistory.slice(-100);
                }

                await room.save();

                // Broadcast message to all users in the room
                io.to(roomId).emit('new-message', chatMessage);

            } catch (err) {
                console.error('Error sending message:', err);
                socket.emit('error', { message: 'Failed to send message' });
            }
        });

        // Handle code execution results
        socket.on('code-run-result', async ({ roomId, results }) => {
            try {
                const room = await TeamRoom.findOne({ roomId });

                if (!room) {
                    socket.emit('error', { message: 'Room not found' });
                    return;
                }

                room.testResults = {
                    lastRun: new Date(),
                    results
                };

                await room.save();

                // Broadcast results to all users
                io.to(roomId).emit('test-results', {
                    results,
                    userId: socket.userId,
                    timestamp: new Date()
                });

            } catch (err) {
                console.error('Error saving test results:', err);
            }
        });

        // Handle user typing indicator
        socket.on('typing', ({ roomId, isTyping }) => {
            socket.to(roomId).emit('user-typing', {
                userId: socket.userId,
                isTyping,
                timestamp: new Date()
            });
        });

        // Handle disconnection
        socket.on('disconnect', async (reason) => {
            console.log(`👋 User disconnected: ${socket.userId}`, {
                reason,
                socketId: socket.id,
                connectedClients: io.engine.clientsCount
            });

            if (socket.currentRoom) {
                try {
                    const room = await TeamRoom.findOne({ roomId: socket.currentRoom });

                    if (room) {
                        // Update participant status
                        const participant = room.participants.find(
                            p => p.userId.toString() === socket.userId
                        );

                        if (participant) {
                            participant.isActive = false;
                            await room.save();
                        }

                        // Notify others
                        socket.to(socket.currentRoom).emit('user-left', {
                            userId: socket.userId,
                            timestamp: new Date()
                        });
                    }
                } catch (err) {
                    console.error('Error handling disconnect:', err);
                }
            }
        });

        // Handle leaving room
        socket.on('leave-room', async ({ roomId }) => {
            try {
                socket.leave(roomId);
                socket.currentRoom = null;

                // Notify others
                socket.to(roomId).emit('user-left', {
                    userId: socket.userId,
                    timestamp: new Date()
                });

                console.log(`👋 User ${socket.userId} left room ${roomId}`);

            } catch (err) {
                console.error('Error leaving room:', err);
            }
        });
    });
};
