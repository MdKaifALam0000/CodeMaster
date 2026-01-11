const nodemailer = require("nodemailer");

const mailSender = async (email, title, body, attachments = []) => {
    // Validation
    if (!process.env.MAIL_HOST || !process.env.MAIL_USER || !process.env.MAIL_PASS) {
        console.error("❌ Missing Mail Environment Variables:", {
            host: !!process.env.MAIL_HOST,
            user: !!process.env.MAIL_USER,
            pass: !!process.env.MAIL_PASS
        });
        throw new Error("Server Email Configuration is missing. Check environment variables.");
    }

    try {
        const config = {
            host: process.env.MAIL_HOST,
            service: process.env.MAIL_HOST === 'smtp.gmail.com' ? 'gmail' : undefined,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        };

        console.log("📧 Attempting to send email with config:", {
            host: config.host,
            user: config.auth.user,
            service: config.service
        });

        let transporter = nodemailer.createTransport(config);

        let info = await transporter.sendMail({
            from: `"CodeMaster" <${process.env.MAIL_USER}>`, // Use your verified email
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`,
            attachments: attachments
        })
        console.log("Email sent successfully:", info.messageId);
        return info;
    }
    catch (error) {
        console.error("Mail Sender Error:", error.message);
        throw error;
    }
}


module.exports = mailSender;
