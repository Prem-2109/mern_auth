import jwt from 'jsonwebtoken';

const userAuth = async (req, res, next) => {
    try {
        // Extract token from cookies
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not Authorized. Please log in again.',
            });
        }

        try {
            // Verify the token
            const tokenDecoded = jwt.verify(token, process.env.JWT_SECRET);

            if (tokenDecoded?.id) {
                req.body.userId = tokenDecoded.id; // Set user ID in request body
                next(); // Proceed to the next middleware
            } else {
                return res.status(401).json({
                    success: false,
                    message: 'Not Authorized. Please log in again.',
                });
            }
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: 'Invalid or expired token. Please log in again.',
            });
        }
    } catch (error) {
        // Handle unexpected errors
        return res.status(500).json({
            success: false,
            message: 'An error occurred during authentication.',
        });
    }
};

export default userAuth;
