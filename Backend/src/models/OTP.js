const mongoose = require("mongoose");
const mailSender = require("../utils/mailSender");
const emailTemplate = require("../mail/template/emailVerificationTemplate");
const { resetPasswordTemplate } = require("../mail/template/resetPasswordTemplate");

const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        enum: ['Registration', 'ResetPassword'],
        default: 'Registration'
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: 60 * 5, // The document will be automatically deleted after 5 minutes of its creation time
    },
});

// Define a function to send emails
async function sendVerificationEmail(email, otp, type) {
    try {
        let html;
        let attachments;
        let subject;

        if (type === 'ResetPassword') {
            const template = resetPasswordTemplate(otp);
            // resetPasswordTemplate returns a string directly, but sometimes templates return {html, attachments}. 
            // In our template we return just string.
            html = typeof template === 'string' ? template : template.html;
            attachments = typeof template === 'string' ? [] : template.attachments;
            subject = "Reset Password Verification - CodeMaster";
        } else {
            const template = emailTemplate(otp);
            html = typeof template === 'string' ? template : template.html;
            attachments = typeof template === 'string' ? [] : template.attachments;
            subject = "Verification Email - CodeMaster";
        }

        const mailResponse = await mailSender(
            email,
            subject,
            html,
            attachments
        );
        if (mailResponse) {
            console.log("Email sent successfully: ", mailResponse.response);
        }
    } catch (error) {
        console.log("Error occurred while sending email: ", error);
        throw error;
    }
}


// Define a post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {
    console.log("New document saved to database");

    // Only send an email when a new document is created
    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp, this.type);
    }
    next();
});

const OTP = mongoose.model("OTP", OTPSchema);

module.exports = OTP;
