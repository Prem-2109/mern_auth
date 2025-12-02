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

// ⭐ CORS MUST BE FIRST ⭐
app.use(
  cors({
    origin: "https://mern-auth-frontend-qq28.onrender.com",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// Health check
app.get("/", (req, res) => res.send("API Working"));

app.use("/api/auth", authroutes);
app.use("/api/user", userRouter);

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ success: false, message: "Not Found" });
});

// Error handler
app.use((error, req, res, next) => {
  res.status(error.status || 500).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
});

app.listen(port, () => console.log(`Server running on PORT: ${port}`));

export default app;
