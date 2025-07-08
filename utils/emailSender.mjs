import nodemailer from 'nodemailer'

const transporter  = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
})

export const sendWelcomeEmail = async (email, username) => {
    const mailOptions = {
        from: `Mind Pal <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Welcome to Mind Pal 🍃`,
        html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://example.com/leaf-logo.png" alt="Mind Pal Leaf Logo" width="80" style="margin-bottom: 10px;"/>
                    <h1 style="color: #2c3e50;">Welcome to Mind Pal, ${username}!</h1>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <p style="color: #2c3e50;">Thank you for joining Mind Pal. We're excited to have you on board!</p>
                    <p style="color: #2c3e50;">Start exploring all the amazing features we have to offer.</p>
                </div>
                <div style="margin-top: 20px; text-align: center; color: #7f8c8d; font-size: 12px;">
                    <p>If you didn't sign up for Mind Pal, please ignore this email.</p>
                </div>
            </div>
`,
    }
    await transporter.sendMail(mailOptions)
}

export const sendWelcomeBackEmail = async (email, username) => {
    const mailOptions = {
        from: `Mind Pal <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Welcome back to Mind Pal, ${username}! 🍃`,
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://example.com/leaf-logo.png" alt="Mind Pal Leaf Logo" width="80" style="margin-bottom: 10px;"/>
                    <h1 style="color: #2c3e50;">Welcome back, ${username}!</h1>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <p style="color: #2c3e50;">We're thrilled to see you again. Let's continue your journey towards better mental health.</p>
                </div>
                <div style="margin-top: 20px; text-align: center; color: #7f8c8d; font-size: 12px;">
                    <p>If you didn't log in to Mind Pal, please ignore this email.</p>
                </div>
            </div>
        `,
    }
    await transporter.sendMail(mailOptions)
}

export const sendOTPEmail = async (email, otp) => {
    const mailOptions = {
        from: `Mind Pal <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Your Password Reset OTP',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="text-align: center; margin-bottom: 20px;">
                    <img src="https://example.com/leaf-logo.png" alt="Mind Pal Leaf Logo" width="80" style="margin-bottom: 10px;"/>
                    <h1 style="color: #2c3e50;">Password Reset Request</h1>
                </div>
                <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px;">
                    <p style="color: #2c3e50;">Your OTP for password reset is:</p>
                    <h2 style="text-align: center; color: #2c3e50; margin: 20px 0;">${otp}</h2>
                    <p style="color: #2c3e50;">This OTP is valid for 15 minutes.</p>
                </div>
                <div style="margin-top: 20px; text-align: center; color: #7f8c8d; font-size: 12px;">
                    <p>If you didn't request this, please ignore this email.</p>
                </div>
            </div>
        `
    };
    await transporter.sendMail(mailOptions);
};