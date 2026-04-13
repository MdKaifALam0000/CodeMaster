const nodemailer = require('nodemailer');

const mailSender = async (email, title, body, attachments = []) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",   
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS, 
      },
    });

    console.log("📧 Attempting to send email via NodeMailer to:", email);

    let info = await transporter.sendMail({
      from: `"CodeMaster" <${process.env.MAIL_USER}>`,
      to: email,
      subject: title,
      html: body,
      attachments: attachments,
    });

    console.log("✅ Email sent successfully! Message ID:", info.messageId);
    return info;

  } catch (error) {
    console.error("❌ Mail Sender Error:", error.message);
    throw error;
  }
};

module.exports = mailSender;