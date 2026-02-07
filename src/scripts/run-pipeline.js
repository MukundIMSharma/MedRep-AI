
import mongoose from "mongoose";
import dotenv from "dotenv";
import { runScrapingPipeline } from "../services/scraper.service.js";
import { MedicalDocument } from "../models/medicalDocument.model.js";

// Load environment variables
dotenv.config();

// MongoDB connection
const connectDB = async () => {
    try {
        const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/medrep-ai";
        await mongoose.connect(mongoURI);
        console.log("MongoDB Connected for Pipeline Run");

        // Safety check: Drop unique index on collectionName if it exists
        try {
            await MedicalDocument.collection.dropIndex("collectionName_1");
            console.log("Dropped unique index on collectionName to allow single-collection storage.");
        } catch (e) {
            // Index might not exist, which is fine
        }
    } catch (err) {
        console.error("MongoDB Connection Error:", err.message);
        process.exit(1);
    }
};

const runPipeline = async () => {
    await connectDB();

    console.log("Starting Full Scraper Pipeline...");
    try {
        await runScrapingPipeline();
        console.log("Pipeline Completed Successfully!");
    } catch (error) {
        console.error("Pipeline Failed:", error);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
};

runPipeline();
