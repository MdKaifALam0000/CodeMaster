const nodemailer = require('nodemailer');
const path = require('path');

const sendEmail = async (email, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // true for 465, false for other ports
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            },
            // timeouts to prevent hanging
            connectionTimeout: 10000,
            greetingTimeout: 5000,
            socketTimeout: 10000
        });

        // Path to local logo file - Updated to point to Backend assets
        const logoPath = path.join(__dirname, '../assets/websitelogo.avif');

        // Check if logo exists before sending
        const fs = require('fs');
        if (!fs.existsSync(logoPath)) {
            console.warn(`Warning: Logo file not found at ${logoPath}`);
        }

        const mailOptions = {
            from: process.env.MAIL_USER,
            to: email,
            subject: 'Verify Your Email - The Turing Forge',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <div style="background: linear-gradient(135deg, #1f2937 0%, #111827 100%); padding: 30px; text-align: center;">
                         <img src="cid:logo" alt="The Turing Forge" style="height: 60px; margin-bottom: 10px;" />
                         <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Verify Your Email</h1>
                    </div>
                    
                    <div style="padding: 40px; background-color: #ffffff;">
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                            Hello,
                        </p>
                        <p style="color: #4b5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                            Thank you for joining <strong>The Turing Forge</strong>. To complete your registration, please use the One-Time Password (OTP) below to verify your email address.
                        </p>
                        
                        <div style="background-color: #f3f4f6; border-radius: 12px; padding: 20px; text-align: center; margin: 30px 0;">
                            <span style="display: inline-block; font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #4f46e5; background: #ffffff; padding: 15px 30px; border-radius: 8px; border: 1px solid #e5e7eb; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
                                ${otp}
                            </span>
                        </div>
                        
                        <p style="color: #4b5563; font-size: 14px; line-height: 1.6; margin-top: 30px;">
                            This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone.
                        </p>
                        <p style="color: #9ca3af; font-size: 14px; margin-top: 20px;">
                            If you did not request this verification, please ignore this email.
                        </p>
                    </div>
                    
                    <div style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                        <p style="color: #9ca3af; font-size: 12px; margin: 0;">
                            &copy; 2025 The Turing Forge. All rights reserved.
                        </p>
                    </div>
                </div>
            `,
            attachments: [
                {
                    filename: 'websitelogo.avif',
                    path: logoPath,
                    cid: 'logo' // Data URI for inline image
                }
            ]
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return info;

    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};

module.exports = sendEmail;
