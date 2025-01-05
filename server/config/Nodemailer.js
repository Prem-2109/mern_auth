import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config(); // Ensure .env variables are loaded

const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587, // Use 465 for SSL if needed
    secure: false, // Set to true if using port 465
    auth: {
        user: process.env.SMTP_USER, // Your Brevo email or API key
        pass: process.env.SMTP_PASS // Your Brevo SMTP password or API key
    },
    tls: {
        rejectUnauthorized: false // Optional: Use only if certificate issues arise
    }
});

export default transporter;