const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userMiddleware');
const {
    createRoom,
    getActiveRooms,
    getRoomById,
    joinRoom,
    leaveRoom,
    deleteRoom,
    getUserRooms
} = require('../controllers/teamCoding');

// Create a new team coding room
router.post('/create', userAuth, createRoom);

// Get all active rooms
router.get('/rooms', userAuth, getActiveRooms);

// Get user's rooms
router.get('/my-rooms', userAuth, getUserRooms);

// Get specific room by ID
router.get('/room/:roomId', userAuth, getRoomById);

// Join a room
router.post('/room/:roomId/join', userAuth, joinRoom);

// Leave a room
router.post('/room/:roomId/leave', userAuth, leaveRoom);

// Delete/close a room (host only)
router.delete('/room/:roomId', userAuth, deleteRoom);

module.exports = router;
