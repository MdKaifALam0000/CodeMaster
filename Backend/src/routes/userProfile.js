const express = require('express');
const router = express.Router();
const userAuth = require('../middleware/userMiddleware');
const {
    getUserProfile,
    updateUserProfile,
    generateProfilePictureSignature,
    saveProfilePicture,
    deleteProfilePicture,
    getUserProgress,
    getLeaderboard
} = require('../controllers/userProfile');

// Get user profile with stats
router.get('/profile', userAuth, getUserProfile);

// Update user profile
router.put('/profile', userAuth, updateUserProfile);

// Generate signature for profile picture upload
router.get('/profile/picture/signature', userAuth, generateProfilePictureSignature);

// Save profile picture metadata after upload
router.post('/profile/picture', userAuth, saveProfilePicture);

// Delete profile picture
router.delete('/profile/picture', userAuth, deleteProfilePicture);

// Get user progress data
router.get('/progress', userAuth, getUserProgress);

// Get leaderboard
router.get('/leaderboard', userAuth, getLeaderboard);

module.exports = router;
