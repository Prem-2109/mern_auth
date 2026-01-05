import mongoose from "mongoose";

const connectDB = async () => {
  try {
    if (mongoose.connection.readyState === 1) {
      console.log("MongoDB already connected");
      return;
    }

    mongoose.connection.once("connected", () => {
      console.log("Database Connected");
    });

    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "mern_auth"
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
