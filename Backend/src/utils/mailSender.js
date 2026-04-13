const nodemailer = require('nodemailer');

const mailSender = async (email, title, body, attachments = []) => {
    try {
        // Create a Transporter to send emails
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST, // smtp.gmail.com
            port: 465,                   // Explicit SSL Port
            secure: true,                // Use SSL
            auth: {
                user: process.env.MAIL_USER, // your gmail
                pass: process.env.MAIL_PASS, // your app password
            }
        });

        console.log("📧 Attempting to send email via NodeMailer to:", email);

        // Send emails to users
        let info = await transporter.sendMail({
            from: `"CodeMaster" <${process.env.MAIL_USER}>`,
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
            // We pass attachments below (though we removed them from the template, we'll keep the param just in case)
            attachments: attachments 
        });

        console.log("✅ Email sent successfully! Message ID:", info.messageId);
        return info;
    } catch (error) {
        console.error("❌ Mail Sender Error:", error.message);
        throw error;
    }
};

module.exports = mailSender;
