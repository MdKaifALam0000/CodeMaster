const TeamRoom = require('../models/teamRoom');
const Problem = require('../models/problem');
const User = require('../models/user');
const { nanoid } = require('nanoid');

// ================== TEAM CODING CONTROLLERS ==================

// Create a new team coding room
const createRoom = async (req, res) => {
    try {
        console.log('Creating room, body:', req.body);
        const { roomName, problemId, maxParticipants, language, timeLimit } = req.body; // timeLimit in minutes
        const userId = req.result._id;

        // Validate problem exists
        const problem = await Problem.findById(problemId);
        if (!problem) {
            console.error('Problem not found for ID:', problemId);
            return res.status(404).json({
                success: false,
                error: 'Problem not found'
            });
        }

        // Generate unique room ID
        const roomId = nanoid(10);

        // Get initial code for selected language
        const langMap = { javascript: 'JavaScript', java: 'Java', cpp: 'C++' };
        const initialCode = (problem.startCode || []).find(
            sc => sc.language === langMap[language || 'javascript']
        )?.initialCode || '';

        // Create room
        const room = new TeamRoom({
            roomId,
            roomName: roomName || `${problem.title} - Team Session`,
            problemId,
            host: userId,
            participants: [{
                userId,
                joinedAt: new Date(),
                isActive: true
            }],
            maxParticipants: maxParticipants || 6,
            language: language || 'javascript',
            code: initialCode,
            code: initialCode,
            isActive: true,
            isLocked: false, // Explicitly set
            expiresAt: timeLimit ? new Date(Date.now() + timeLimit * 60000) : null // Set expiration if timeLimit provided
        });

        await room.save();
        console.log('Room created successfully:', roomId);

        // Populate room data
        await room.populate('problemId', 'title difficulty tags');
        await room.populate('host', 'firstName lastName emailId profilePicture');

        res.status(201).json({
            success: true,
            room
        });

    } catch (err) {
        console.error('Error creating room:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to create room'
        });
    }
};

// Get all active rooms
const getActiveRooms = async (req, res) => {
    try {
        console.log('Fetching active rooms...');
        // Use $ne: true to handle cases where isLocked is undefined or false
        // Filter out expired rooms if they haven't been deleted yet
        const rooms = await TeamRoom.find({
            isActive: true,
            isLocked: { $ne: true },
            $or: [
                { expiresAt: null },
                { expiresAt: { $gt: new Date() } }
            ]
        })
            .populate('problemId', 'title difficulty tags')
            .populate('host', 'firstName lastName profilePicture')
            .populate('participants.userId', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 })
            .limit(50);

        console.log(`Found ${rooms.length} active rooms`);

        res.status(200).json({
            success: true,
            rooms
        });

    } catch (err) {
        console.error('Error fetching rooms:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rooms'
        });
    }
};

// Get room by ID
const getRoomById = async (req, res) => {
    try {
        const { roomId } = req.params;

        const room = await TeamRoom.findOne({ roomId })
            .populate('problemId')
            .populate('host', 'firstName lastName emailId profilePicture')
            .populate('participants.userId', 'firstName lastName profilePicture');

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        res.status(200).json({
            success: true,
            room
        });

    } catch (err) {
        console.error('Error fetching room:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch room'
        });
    }
};

// Join a room
const joinRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.result._id;

        const room = await TeamRoom.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        if (!room.isActive) {
            return res.status(400).json({
                success: false,
                error: 'Room is no longer active'
            });
        }

        if (room.isLocked) {
            return res.status(403).json({
                success: false,
                error: 'Room is locked'
            });
        }

        // Check if already in room
        const alreadyJoined = room.participants.some(
            p => p.userId.toString() === userId.toString()
        );

        if (alreadyJoined) {
            return res.status(400).json({
                success: false,
                error: 'Already in room'
            });
        }

        // Check room capacity
        if (room.participants.length >= room.maxParticipants) {
            return res.status(400).json({
                success: false,
                error: 'Room is full'
            });
        }

        // Add participant
        room.participants.push({
            userId,
            joinedAt: new Date(),
            isActive: true
        });

        await room.save();
        await room.populate('participants.userId', 'firstName lastName profilePicture');

        res.status(200).json({
            success: true,
            room
        });

    } catch (err) {
        console.error('Error joining room:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to join room'
        });
    }
};

// Leave a room
const leaveRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.result._id;

        const room = await TeamRoom.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Remove participant
        room.participants = room.participants.filter(
            p => p.userId.toString() !== userId.toString()
        );

        // If host leaves, assign new host or close room
        if (room.host.toString() === userId.toString()) {
            if (room.participants.length > 0) {
                room.host = room.participants[0].userId;
            }
            // Removed: room.isActive = false; Room stays active until expired or manually closed by host
        }

        await room.save();

        res.status(200).json({
            success: true,
            message: 'Left room successfully'
        });

    } catch (err) {
        console.error('Error leaving room:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to leave room'
        });
    }
};

// Delete/Close room (host only)
const deleteRoom = async (req, res) => {
    try {
        const { roomId } = req.params;
        const userId = req.result._id;

        const room = await TeamRoom.findOne({ roomId });

        if (!room) {
            return res.status(404).json({
                success: false,
                error: 'Room not found'
            });
        }

        // Only host can delete
        if (room.host.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                error: 'Only host can delete room'
            });
        }

        room.isActive = false;
        await room.save();

        res.status(200).json({
            success: true,
            message: 'Room closed successfully'
        });

    } catch (err) {
        console.error('Error deleting room:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to delete room'
        });
    }
};

// Get user's rooms
const getUserRooms = async (req, res) => {
    try {
        const userId = req.result._id;

        const rooms = await TeamRoom.find({
            $or: [
                { host: userId },
                { 'participants.userId': userId }
            ],
            isActive: true
        })
            .populate('problemId', 'title difficulty tags')
            .populate('host', 'firstName lastName profilePicture')
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            rooms
        });

    } catch (err) {
        console.error('Error fetching user rooms:', err);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch rooms'
        });
    }
};

module.exports = {
    createRoom,
    getActiveRooms,
    getRoomById,
    joinRoom,
    leaveRoom,
    deleteRoom,
    getUserRooms
};
