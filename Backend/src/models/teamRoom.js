const mongoose = require('mongoose');

const teamRoomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    roomName: {
        type: String,
        required: true
    },
    problemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: true
    },
    host: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    participants: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        joinedAt: {
            type: Date,
            default: Date.now
        },
        isActive: {
            type: Boolean,
            default: true
        }
    }],
    maxParticipants: {
        type: Number,
        default: 6,
        min: 2,
        max: 10
    },
    language: {
        type: String,
        enum: ['javascript', 'java', 'cpp'],
        default: 'javascript'
    },
    code: {
        type: String,
        default: ''
    },
    isLocked: {
        type: Boolean,
        default: false
    },
    isActive: {
        type: Boolean,
        default: true
    },
    chatHistory: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        message: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    codeHistory: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        username: String,
        code: String,
        timestamp: {
            type: Date,
            default: Date.now
        }
    }],
    testResults: {
        lastRun: Date,
        results: Object
    },
    editorLock: {
        lockedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        lockedAt: { type: Date, default: null },
        username: { type: String, default: null }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        // Removed auto-expires: We will handle expiration logically or via a scheduled job
    },
    expiresAt: {
        type: Date,
        default: null, // Null means no expiration (or default 24h logic if needed)
        index: { expires: 0 } // This creates a TTL index that deletes the document when the current time > expiresAt
    }
}, {
    timestamps: true
});

// Index for faster queries
teamRoomSchema.index({ isActive: 1, createdAt: -1 });
teamRoomSchema.index({ host: 1 });

module.exports = mongoose.model('TeamRoom', teamRoomSchema);
