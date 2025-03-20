export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
    }

    try {
        console.log("Checking database connection...");
        const user = await userModel.findOne({ email });

        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid Password' });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET is missing from environment variables!");
            return res.status(500).json({ success: false, message: 'Internal Server Error' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',  // Ensure secure cookies in production
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000
        });

        return res.status(200).json({ success: true, message: "Login successful" });

    } catch (error) {
        console.error("Login error:", error.message);
        return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
