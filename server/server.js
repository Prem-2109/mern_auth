import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authroutes from './routes/authroutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;
// Connect to the database
connectDB();
//const allowedOrigins = ['http://localhost:5173/']
// Middleware setup
app.use(express.json()); // Parse JSON request bodies
app.use(cookieParser()); // Parse cookies from request headers
app.use(cors({
    credentials: true,
    origin: process.env.CORS_ORIGIN || 'https://mern-auth-frontend-qq28.onrender.com' // Adjust with your frontend URL
}));
// Routes
app.get('/', (req, res) => res.send("API Working"));
app.use('/api/auth', authroutes);
app.use('/api/user', userRouter);

// Global Error Handler (for unhandled routes or errors)
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error); // Pass the error to the global error handler
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
});

// Start the server
app.listen(port, () => console.log(`Server started on PORT: ${port}`));
