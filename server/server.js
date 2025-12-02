import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import connectDB from './config/mongodb.js';
import authroutes from './routes/authroutes.js';
import userRouter from './routes/userRoutes.js';

const app = express();
const port = process.env.PORT || 4000;

connectDB();

app.use(express.json());
app.use(cookieParser());

// ⭐ FIXED CORS (Render)
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "https://mern-auth-frontend-qq28.onrender.com",
    credentials: true,
  })
);

app.get('/', (req, res) => res.send("API Working"));

app.use('/api/auth', authroutes);
app.use('/api/user', userRouter);

// Error handling
app.use((req, res, next) => {
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

app.use((error, req, res, next) => {
    res.status(error.status || 500).json({
        success: false,
        message: error.message || 'Internal Server Error'
    });
});

app.listen(port, () => console.log(`Server started on PORT: ${port}`));
