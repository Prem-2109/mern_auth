import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import userModel from '../models/usermodels.js';
import transporter from '../config/Nodemailer.js';
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplate.js';


export const register = async (req, res) => {

    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({ success: false, message: 'Missing Details' })
    }


    try {
        const existingUser = await userModel.findOne({ email });

        if (existingUser) {
            return res.json({ success: false, message: 'User already Exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new userModel({ name, email, password: hashedPassword });
        await user.save();

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        //sending welcome mail
        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: 'Welcome to PKs Dev',
            text: `Welcome to Pk Website, Your Account has been created with Email id:${email}`
        }
        transporter.sendMail(mailOptions)
            .then(info => console.log('Email sent:', info))
            .catch(error => console.error('Error sending email:', error));

        return res.json({ success: true });

    } catch (error) {
        res.json({ success: false, message: error.message })

    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({ success: false, message: 'Email and password are required' })
    }


    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'Invalid email' })
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: 'Invalid Password' })
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });



        return res.json({ success: true });


    } catch (error) {
        return res.json({ success: false, message: error.message });
    }

}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
        })

        return res.json({ success: true, message: "Logged out" });

    } catch (error) {
        return res.json({ success: false, message: error.message });
    }
}

export const sendVerifyOtp = async (req, res) => {
    try {

        const { userId } = req.body;
        const user = await userModel.findById(userId);

        if (user.isAccountVerified) {
            return res.json({ success: false, message: "Account Already Verified" });
        }

        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 24 * 60 * 60 * 1000
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Account Verification OTP',
            //text: `Your OTP is ${otp}. Verify your account using this OTP `,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOption);
        res.json({ success: true, message: 'Verification OTP Sent on Email' })


    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const verifyEmail = async (req, res) => {
    const { userId, otp } = req.body;

    // Check for missing details
    if (!userId || !otp) {
        return res.status(400).json({ success: false, message: "Missing details" });
    }

    try {
        // Fetch the user by ID
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        // Check OTP validity
        if (!user.verifyOtp || user.verifyOtp !== otp) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        // Check if OTP has expired
        if (user.verifyOtpExpireAt < Date.now()) {
            return res.status(400).json({ success: false, message: "OTP has expired" });
        }

        // Mark account as verified and reset OTP details
        user.isAccountVerified = true;
        user.verifyOtp = '';
        user.verifyOtpExpireAt = null;

        await user.save();
        return res.status(200).json({ success: true, message: "Email verified successfully" });

    } catch (error) {
        console.error("Error verifying email:", error); // Log for debugging
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const sendResetOtp = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.json({ success: false, message: 'Email is required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });
        }
        const otp = String(Math.floor(100000 + Math.random() * 900000));
        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000
        await user.save();

        const mailOption = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: 'Password Reset OTP',
            text: `Your OTP for resetting your password is ${otp}. Use this OTP to proceed with resetting your password.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}",user.email)
        }
        await transporter.sendMail(mailOption);
        return res.json({ success: true, message: 'OTP sent to your Email' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({ success: false, message: 'Email, OTP, and New password are Required' });
    }

    try {
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: 'User not found' });

        }
        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({ success: false, message: 'Invalid OTP' });
        }
        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({ success: false, message: 'OTP Expired' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();
        return res.json({ success: true, message: 'Password has been reset successfully' });

    } catch (error) {
        res.json({ success: false, message: error.message });
    }
}

