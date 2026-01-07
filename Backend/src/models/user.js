const mongoose = require('mongoose');
const { Schema } = mongoose;

const userSchema = new Schema({
    firstName: {
        type: String,
        required: true,
        minLength: 3,
        maxLength: 20
    },
    lastName: {
        type: String,
        minLength: 3,
        maxLength: 20
    },
    emailId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        immutable: true,
    },
    age: {
        type: Number,
        min: 6,
        max: 100
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    problemSolved: {
        type: [{
            type: Schema.Types.ObjectId,
            ref: 'Problem',
            unique: true
        }],
    },
    password: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        default: ''
    },
    cloudinaryPublicId: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        maxLength: 500,
        default: ''
    },
    skills: {
        type: [String],
        default: []
    },
    githubUrl: {
        type: String,
        default: ''
    },
    linkedinUrl: {
        type: String,
        default: ''
    },

}, {
    timestamps: true,
});

//pre-> jo exceute hone se pehle chalta hian 
//post -> jo execute hone ke baad chaltaa hain

//yeh post waala function tbhi chalega jab findOneAndDelete rahegaw tbhi chalega (yeh mongoose ka features nahi hin yeh mongodb ka feteaure hain !!)

userSchema.post('findOneAndDelete', async function (userInfo) {
    if (userInfo) {
        await mongoose.model('Submission').deleteMany({ userId: userInfo._id });
    }
});


const User = mongoose.model('User', userSchema);
module.exports = User;