const { Resend } = require('resend');

const mailSender = async (email, title, body, attachments = []) => {
    // Validation
    if (!process.env.RESEND_API_KEY) {
        console.error("❌ Missing RESEND_API_KEY environment variable");
        throw new Error("Server Email Configuration is missing. RESEND_API_KEY not set.");
    }

    const resend = new Resend(process.env.RESEND_API_KEY);

    // FROM address: use your verified domain on Resend, or fallback to onboarding for dev
    const fromAddress = process.env.MAIL_FROM || 'onboarding@resend.dev';

    console.log("📧 Attempting to send email via Resend:", {
        to: email,
        subject: title,
        from: fromAddress
    });

    try {
        const { data, error } = await resend.emails.send({
            from: `CodeMaster <${fromAddress}>`,
            to: [email],
            subject: title,
            html: body,
        });

        if (error) {
            console.error("Resend API Error:", error);
            throw new Error(error.message || "Failed to send email via Resend");
        }

        console.log("✅ Email sent successfully via Resend. ID:", data.id);
        return data;
    } catch (error) {
        console.error("Mail Sender Error:", error.message);
        throw error;
    }
};

module.exports = mailSender;
