import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function checkQdrant() {
    const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
    const apiKey = process.env.QDRANT_API_KEY;
    console.log(`🔍 Checking Qdrant connection at ${qdrantUrl}...`);

    const headers = {};
    if (apiKey) {
        headers['api-key'] = apiKey;
    }

    try {
        const response = await fetch(`${qdrantUrl}/collections`, { headers });
        const data = await response.json();

        if (response.ok) {
            console.log("✅ Qdrant is ONLINE!");
            const collections = data.result?.collections || [];
            console.log(`📊 Found ${collections.length} collections.`);

            const activeCollection = process.env.QDRANT_COLLECTION || "Public_data";
            if (collections.some(c => c.name === activeCollection)) {
                console.log(`\n🔎 Inspecting active collection: "${activeCollection}"...`);
                const collResp = await fetch(`${qdrantUrl}/collections/${activeCollection}`, { headers });
                const collData = await collResp.json();

                if (collResp.ok) {
                    const config = collData.result.config;
                    console.log("   - Dense Vectors:", JSON.stringify(config.params.vectors, null, 2));
                    console.log("   - Sparse Vectors:", JSON.stringify(config.params.sparse_vectors, null, 2));

                    if (!config.params.sparse_vectors || !config.params.sparse_vectors.sparse) {
                        console.warn("\n⚠️ WARNING: Sparse vector 'sparse' NOT FOUND in this collection.");
                    }
                }
            } else {
                console.log(`\n⚠️ Collection "${activeCollection}" not found.`);
            }
        } else {
            console.error("❌ Qdrant returned an error:", data.status?.error || response.statusText);
        }
    } catch (error) {
        console.error("❌ FAILED to connect to Qdrant.");
        console.error("   Error Message:", error.message);
    }
}

checkQdrant();
