const resetPasswordTemplate = (otp) => {
    return `<!DOCTYPE html>
    <html>
    
    <head>
        <meta charset="UTF-8">
        <title>Reset Password OTP</title>
        <style>
            body {
                background-color: #ffffff;
                font-family: Arial, sans-serif;
                font-size: 16px;
                line-height: 1.4;
                color: #333333;
                margin: 0;
                padding: 0;
            }
    
            .container {
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
                text-align: center;
            }
    
            .logo {
                max-width: 200px;
                margin-bottom: 20px;
            }
    
            .message {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 20px;
            }
    
            .body {
                font-size: 16px;
                margin-bottom: 20px;
            }
    
            .support {
                font-size: 14px;
                color: #999999;
                margin-top: 20px;
            }
    
            .highlight {
                font-weight: bold;
                font-size: 24px;
                color: #FFD60A;
                letter-spacing: 2px;
            }
        </style>
    
    </head>
    
    <body>
        <div class="container">
            <a href="https://codemaster-1.onrender.com/"><img class="logo"
                    src="https://i.ibb.co/7Xyj3PC/logo.png" alt="CodeMaster Logo"></a>
            <div class="message">Reset Password OTP Verification</div>
            <div class="body">
                <p>Dear User,</p>
                <p>You have requested to reset your password. Please use the following OTP (One-Time Password) to proceed:</p>
                <h2 class="highlight">${otp}</h2>
                <p>This OTP is valid for 5 minutes. If you did not request a password reset, please ignore this email.</p>
            </div>
            <div class="support">If you have any questions or need assistance, please feel free to reach out to us at <a
                    href="mailto:info@codemaster.com">info@codemaster.com</a>. We are here to help!</div>
        </div>
    </body>
    
    </html>`;
};

module.exports = { resetPasswordTemplate };
