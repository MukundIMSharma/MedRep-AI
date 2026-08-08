import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectdb = async () => {
    try {
        if (!process.env.MONGO_URI) {
            throw new Error("MONGO_URI is not configured");
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
        });
        console.log("✅ MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection error", error);
        throw error;
    }
}

export default connectdb
