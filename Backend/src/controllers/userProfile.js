const cloudinary = require("cloudinary").v2;
const User = require('../models/user');
const Submission = require('../models/submission');
const Problem = require('../models/problem');

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.CLOUD_API_KEY,
    api_secret: process.env.CLOUD_API_SECRET
});

// Get user profile with stats
const getUserProfile = async (req, res) => {
    try {
        const userId = req.result._id;

        const user = await User.findById(userId)
            .select('-password')
            .populate('problemSolved', 'title difficulty');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Get submission stats
        const submissions = await Submission.find({ userId });
        const acceptedSubmissions = submissions.filter(sub => sub.status === 'accepted');

        // Calculate stats
        const stats = {
            totalSubmissions: submissions.length,
            acceptedSubmissions: acceptedSubmissions.length,
            problemsSolved: user.problemSolved.length,
            successRate: submissions.length > 0
                ? ((acceptedSubmissions.length / submissions.length) * 100).toFixed(2)
                : 0
        };

        res.status(200).json({
            user,
            stats
        });

    } catch (err) {
        console.error('Error fetching user profile:', err);
        res.status(500).json({ error: 'Failed to fetch user profile' });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const userId = req.result._id;
        const { firstName, lastName, age, bio, skills, githubUrl, linkedinUrl } = req.body;

        const updateData = {};
        if (firstName) updateData.firstName = firstName;
        if (lastName) updateData.lastName = lastName;
        if (age) updateData.age = age;
        if (bio !== undefined) updateData.bio = bio;
        if (skills) updateData.skills = Array.isArray(skills) ? skills : skills.split(',').map(s => s.trim());
        if (githubUrl !== undefined) updateData.githubUrl = githubUrl;
        if (linkedinUrl !== undefined) updateData.linkedinUrl = linkedinUrl;

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({ error: err.message || 'Failed to update profile' });
    }
};

// Generate upload signature for profile picture
const generateProfilePictureSignature = async (req, res) => {
    try {
        const userId = req.result._id;
        const timestamp = Math.round(new Date().getTime() / 1000);
        const publicId = `codemaster-profiles/${userId}_${timestamp}`;

        const uploadParams = {
            timestamp: timestamp,
            public_id: publicId,
            transformation: 'c_fill,g_face,h_400,w_400'
        };

        const signature = cloudinary.utils.api_sign_request(
            uploadParams,
            process.env.CLOUD_API_SECRET
        );

        res.json({
            signature,
            timestamp,
            public_id: publicId,
            api_key: process.env.CLOUD_API_KEY,
            cloud_name: process.env.CLOUD_NAME,
            upload_url: `https://api.cloudinary.com/v1_1/${process.env.CLOUD_NAME}/image/upload`,
        });
    } catch (error) {
        console.error("Error generating upload signature:", error);
        res.status(500).json({ error: 'Failed to generate upload credentials' });
    }
};

// Save profile picture metadata
const saveProfilePicture = async (req, res) => {
    try {
        const userId = req.result._id;
        const { cloudinaryPublicId, secureUrl } = req.body;

        if (!cloudinaryPublicId || !secureUrl) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Verify image exists on Cloudinary
        const cloudinaryResource = await cloudinary.api.resource(
            cloudinaryPublicId,
            { resource_type: 'image' }
        );

        if (!cloudinaryResource) {
            return res.status(400).json({ error: 'Image not found on cloudinary' });
        }

        // Get current user to delete old profile picture
        const user = await User.findById(userId);

        // Delete old profile picture from Cloudinary if exists
        if (user.cloudinaryPublicId) {
            try {
                await cloudinary.uploader.destroy(user.cloudinaryPublicId, {
                    resource_type: 'image',
                    invalidate: true
                });
            } catch (err) {
                console.error('Error deleting old profile picture:', err);
            }
        }

        // Update user with new profile picture
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePicture: secureUrl,
                cloudinaryPublicId: cloudinaryPublicId
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Profile picture updated successfully',
            user: updatedUser
        });

    } catch (err) {
        console.error('Error saving profile picture:', err);
        res.status(500).json({ error: 'Failed to save profile picture' });
    }
};

// Delete profile picture
const deleteProfilePicture = async (req, res) => {
    try {
        const userId = req.result._id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!user.cloudinaryPublicId) {
            return res.status(400).json({ error: 'No profile picture to delete' });
        }

        // Delete from Cloudinary
        await cloudinary.uploader.destroy(user.cloudinaryPublicId, {
            resource_type: 'image',
            invalidate: true
        });

        // Update user
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                profilePicture: '',
                cloudinaryPublicId: ''
            },
            { new: true }
        ).select('-password');

        res.status(200).json({
            message: 'Profile picture deleted successfully',
            user: updatedUser
        });

    } catch (err) {
        console.error('Error deleting profile picture:', err);
        res.status(500).json({ error: 'Failed to delete profile picture' });
    }
};

// Get user progress data
const getUserProgress = async (req, res) => {
    try {
        const userId = req.result._id;

        // Get all submissions with problem details
        const submissions = await Submission.find({ userId })
            .populate('problemId', 'title difficulty tags')
            .sort({ createdAt: -1 });

        // Get all problems
        const allProblems = await Problem.find({});

        // Calculate difficulty-wise stats
        const difficultyStats = {
            easy: { solved: 0, total: 0 },
            medium: { solved: 0, total: 0 },
            hard: { solved: 0, total: 0 }
        };

        // Count total problems by difficulty
        allProblems.forEach(problem => {
            const diff = problem.difficulty.toLowerCase();
            if (difficultyStats[diff]) {
                difficultyStats[diff].total++;
            }
        });

        // Get unique solved problems
        const solvedProblems = new Set();
        const solvedProblemsList = [];

        const acceptedSubmissions = submissions.filter(sub => {
            if (sub.status === 'accepted' && sub.problemId) {
                const problemIdStr = sub.problemId._id.toString();

                // Only increment difficulty stats if this is the first time we see this problem solved
                if (!solvedProblems.has(problemIdStr)) {
                    const diff = sub.problemId.difficulty.toLowerCase();
                    if (difficultyStats[diff]) {
                        difficultyStats[diff].solved++;
                    }
                    solvedProblems.add(problemIdStr);

                    // Add to list
                    solvedProblemsList.push({
                        _id: sub.problemId._id,
                        title: sub.problemId.title,
                        difficulty: sub.problemId.difficulty,
                        tags: sub.problemId.tags,
                        solvedAt: sub.createdAt
                    });
                }
                return true;
            }
            return false;
        });

        // Calculate language-wise stats
        const languageStats = {};
        submissions.forEach(sub => {
            if (!languageStats[sub.language]) {
                languageStats[sub.language] = { total: 0, accepted: 0 };
            }
            languageStats[sub.language].total++;
            if (sub.status === 'accepted') {
                languageStats[sub.language].accepted++;
            }
        });

        // Get submission activity for last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentSubmissions = submissions.filter(sub =>
            new Date(sub.createdAt) >= thirtyDaysAgo
        );

        // Group by date
        const activityData = {};
        recentSubmissions.forEach(sub => {
            const date = new Date(sub.createdAt).toISOString().split('T')[0];
            if (!activityData[date]) {
                activityData[date] = { submissions: 0, accepted: 0 };
            }
            activityData[date].submissions++;
            if (sub.status === 'accepted') {
                activityData[date].accepted++;
            }
        });

        // Recent submissions for table
        const recentSubmissionsTable = submissions.slice(0, 10).map(sub => ({
            _id: sub._id,
            problemTitle: sub.problemId?.title || 'Unknown',
            language: sub.language,
            status: sub.status,
            runtime: sub.runtime,
            memory: sub.memory,
            createdAt: sub.createdAt
        }));

        // Calculate total problems count
        const totalProblemsCount = allProblems.length;

        // Calculate Streak
        let streak = 0;
        if (submissions.length > 0) {
            const sortedSubs = [...submissions].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            let lastDate = new Date(sortedSubs[0].createdAt);
            lastDate.setHours(0, 0, 0, 0);

            // Check if user submitted today or yesterday to start/continue streak
            const diffDays = Math.floor((today - lastDate) / (1000 * 60 * 60 * 24));

            if (diffDays <= 1) {
                streak = 1;
                let currentDate = lastDate;

                for (let i = 1; i < sortedSubs.length; i++) {
                    const subDate = new Date(sortedSubs[i].createdAt);
                    subDate.setHours(0, 0, 0, 0);

                    const dayDiff = Math.floor((currentDate - subDate) / (1000 * 60 * 60 * 24));

                    if (dayDiff === 1) {
                        streak++;
                        currentDate = subDate;
                    } else if (dayDiff === 0) {
                        continue; // Same day, ignore
                    } else {
                        break; // Streak broken
                    }
                }
            }
        }

        res.status(200).json({
            difficultyStats,
            languageStats,
            activityData,
            recentSubmissions: recentSubmissionsTable,
            totalSubmissions: submissions.length,
            acceptedSubmissions: acceptedSubmissions.length,
            problemsSolved: solvedProblems.size,
            solvedProblems: solvedProblemsList,
            totalProblems: totalProblemsCount,
            streak
        });

    } catch (err) {
        console.error('Error fetching user progress:', err);
        res.status(500).json({ error: 'Failed to fetch user progress' });
    }
};

// Get leaderboard data
const getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.find({})
            .select('firstName lastName profilePicture problemSolved')
            .populate('problemSolved', 'difficulty');

        const rankedUsers = leaderboard.map(user => ({
            _id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            profilePicture: user.profilePicture,
            problemSolvedCount: user.problemSolved.length,
            // You could also add more stats here, like total difficulty score
        }))
            .sort((a, b) => b.problemSolvedCount - a.problemSolvedCount)
            .slice(0, 50);

        res.status(200).json(rankedUsers);

    } catch (err) {
        console.error('Error fetching leaderboard:', err);
        res.status(500).json({ error: 'Failed to fetch leaderboard' });
    }
};

module.exports = {
    getUserProfile,
    updateUserProfile,
    generateProfilePictureSignature,
    saveProfilePicture,
    deleteProfilePicture,
    getUserProgress,
    getLeaderboard
};
