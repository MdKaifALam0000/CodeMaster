const nodemailer = require('nodemailer');
const sgMail = require('@sendgrid/mail');

const mailSender = async (email, title, body, attachments = []) => {
  // ==========================================
  // SENDGRID IMPLEMENTATION
  // ==========================================
  try {
    if (!process.env.SENDGRID_API_KEY) {
      throw new Error("SENDGRID_API_KEY environment variable is missing.");
    }

    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    console.log("📧 Attempting to send email via SendGrid to:", email);

    const msg = {
      to: email,
      // You MUST use the exact email address you verify in SendGrid dashboard!
      from: process.env.SENDGRID_FROM_EMAIL || process.env.MAIL_USER, 
      subject: title,
      html: body,
      // SendGrid handles attachments slightly differently, converting to base64 if needed, 
      // but for standard OTPs, we usually don't have attachments anyway.
    };

    const info = await sgMail.send(msg);
    console.log("✅ Email sent successfully via SendGrid!");
    return info;

  } catch (error) {
    console.error("❌ SendGrid Mail Sender Error:", error.response ? error.response.body : error.message);
    throw error;
  }

  // ==========================================
  // NODEMAILER GMAIL IMPLEMENTATION (SAVED)
  // ==========================================
  /*
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
  */
};

module.exports = mailSender;