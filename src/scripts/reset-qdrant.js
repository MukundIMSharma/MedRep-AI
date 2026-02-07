
import dotenv from "dotenv";
import { deleteCollection } from "../services/vectorStore.service.js";

dotenv.config();

const collectionName = process.env.QDRANT_COLLECTION || "insurance_db";

console.log(`Resetting Qdrant Collection: ${collectionName}...`);

async function reset() {
    try {
        await deleteCollection(collectionName);
        console.log("✅ Collection deleted successfully. run:pipeline will recreate it with correct 768 dimensions.");
    } catch (error) {
        if (error.message.includes("404") || error.message.includes("Not Found")) {
            console.log("✅ Collection did not exist (or already deleted). Ready for recreation.");
        } else {
            console.error("❌ Failed to delete collection:", error.message);
        }
    }
}

reset();
