const express = require('express');

const authrouter = express.Router();
const { register, login, logout, adminRegister, deleteProfile, generateOTP } = require('../controllers/userAuthenticate');
const userMiddleware = require('../middleware/userMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

//Register User
authrouter.post('/generate-otp', generateOTP);
authrouter.post('/register', register);
authrouter.post('/login', login);
authrouter.post('/logout', userMiddleware, logout);
authrouter.post('/admin/register', adminMiddleware, adminRegister);
authrouter.delete('/deleteProfile', userMiddleware, deleteProfile);

//this is set so that we don't have to login again and again whenver we visit the website
authrouter.get('/check', userMiddleware, (req, res) => {

    const reply = {
        firstName: req.result.firstName,
        emailId: req.result.emailId,
        _id: req.result._id,
        role: req.result.role,
        profilePicture: req.result.profilePicture
    }

    res.status(200).json({
        user: reply,
        token: req.cookies.token,
        message: "Valid User"
    });
})
//authrouter.get('/userDetails', getUserDetails);



module.exports = authrouter;