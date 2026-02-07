import { InferenceClient } from "@huggingface/inference";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../../.env") });

async function testToken() {
    const client = new InferenceClient(process.env.HF_TOKEN);
    try {
        console.log("Testing token with a simple completion...");
        const response = await client.chatCompletion({
            model: "meta-llama/Llama-3.1-8B-Instruct",
            messages: [{ role: "user", content: "Hi" }],
            max_tokens: 5
        });
        console.log("Token is working for ChatCompletion!");
        console.log("Response:", response.choices[0].message.content);
    } catch (error) {
        console.error("❌ ChatCompletion failed:", error.message);
    }

    try {
        console.log("\nTesting token with embeddings (BAAI/bge-base-en-v1.5)...");
        const fetch = (await import('node-fetch')).default;
        const response = await fetch("https://api-inference.huggingface.co/models/BAAI/bge-base-en-v1.5", {
            headers: { Authorization: `Bearer ${process.env.HF_TOKEN}` },
            method: "POST",
            body: JSON.stringify({ inputs: "Hello world" }),
        });
        const data = await response.json();
        if (response.ok) {
            console.log("Embeddings (BGE) working!");
        } else {
            console.error("❌ Embeddings (BGE) failed:", data.error || data);
        }
    } catch (error) {
        console.error("❌ Embeddings (BGE) error:", error.message);
    }
}

testToken();
