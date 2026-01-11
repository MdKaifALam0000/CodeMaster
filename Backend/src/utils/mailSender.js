const nodemailer = require("nodemailer");

const mailSender = async (email, title, body, attachments = []) => {
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.MAIL_HOST,
            service: process.env.MAIL_HOST === 'smtp.gmail.com' ? 'gmail' : undefined, // Auto-configure for Gmail
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            }
        })

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
