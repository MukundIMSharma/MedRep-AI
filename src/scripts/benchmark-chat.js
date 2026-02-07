import { chat } from "../services/retriever.service.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function runBenchmark(query) {
    console.log(`\n🚀 Starting benchmark for query: "${query}"`);

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ Connected to MongoDB");

        const startTime = Date.now();
        const result = await chat(query);
        const endTime = Date.now();

        console.log("\n--- BENCHMARK RESULTS ---");
        console.log(`Total Time: ${endTime - startTime}ms`);
        console.log(`Found in Sources: ${result.foundInSources}`);
        console.log(`Collections Searched: ${result.searchedCollections.length}`);
        console.log(`Sources Returned: ${result.sources.length}`);
        console.log("-------------------------\n");

        if (result.foundInSources) {
            console.log("Answer Snippet:", result.answer.substring(0, 100) + "...");
        }

    } catch (error) {
        console.error("❌ Benchmark failed:", error);
    } finally {
        await mongoose.disconnect();
        console.log("🔌 Disconnected from MongoDB");
    }
}

const query = process.argv[2] || "Is paracetamol approved in India?";
runBenchmark(query);
