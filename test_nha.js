
import { scrapeNhaSchemes } from "./src/utils/scrapers/nha.scraper.js";
import { runScrapingPipeline } from "./src/services/scraper.service.js";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

async function test() {
    console.log("--- SCRAPER TEST ---");

    console.log("Testing NHA Scraper directly...");
    try {
        const data = await scrapeNhaSchemes();
        console.log(`NHA returned ${data.length} items`);
        if (data.length > 0) {
            console.log("First item sample:", data[0].title);
        }
    } catch (e) {
        console.error("NHA Scraper Error:", e.message);
    }

    console.log("\nTesting Scraper Service Limits logic...");
    // We don't want to run the whole pipeline, just check if the code we are about to run is correct
    // But since it's already on disk, we just need to run it.

    console.log("--- END TEST ---");
    process.exit(0);
}

test();
