import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { QdrantVectorStore } from "@langchain/qdrant";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import fs from "fs";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../utils/constants.js";
import { Document } from "@langchain/core/documents";

/**
 * Creates embeddings instance using HuggingFace
 * @returns {HuggingFaceInferenceEmbeddings}
 */
function getEmbeddings() {
    if (!process.env.HF_TOKEN) {
        console.error("❌ Stats: HF_TOKEN is missing from environment variables!");
    } else {
        // console.log("✅ HF_TOKEN is loaded (Length: " + process.env.HF_TOKEN.length + ")");
    }
    return new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HF_TOKEN,
        model: "sentence-transformers/embeddinggemma-300m-medical", // Switching to more reliable free-tier model
    });
}

/**
 * Generate a collection name for medical documents
 * Uses env var QDRANT_COLLECTION if set, or generates based on category.
 * @param {string} category - Document category
 * @returns {string}
 */
export function generateCollectionName(category) {
    if (process.env.QDRANT_COLLECTION) {
        return process.env.QDRANT_COLLECTION;
    }
    // Default to category-based collections if no single collection is defined
    return `medical-${category.toLowerCase()}`; // Removed Date.now() to group docs by category
}

/**
 * Index a single PDF document into Qdrant vector store
 * @param {string} filepath - Path to the PDF file
 * @param {string} collectionName - Name for the Qdrant collection
 * @param {Object} metadata - Additional metadata
 * @returns {Promise<{success: boolean, documentCount: number, collectionName: string}>}
 */
export async function indexDocument(filepath, collectionName, metadata = {}) {
    const loader = new PDFLoader(filepath);
    const docs = await loader.load();

    // Enrich documents with additional metadata
    const enrichedDocs = docs.map(doc => ({
        ...doc,
        metadata: {
            ...doc.metadata,
            source: metadata.source || "Unknown",
            category: metadata.category || "GENERAL",
            documentName: metadata.name || "Unnamed Document",
            sourceType: metadata.sourceType || DataSourceTypeEnum.UPLOADED,
            sourceUrl: metadata.sourceUrl || "",
            siteName: metadata.siteName || ""
        }
    }));

    const embeddings = getEmbeddings();
    const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
    const qdrantApiKey = process.env.QDRANT_API_KEY;

    await QdrantVectorStore.fromDocuments(enrichedDocs, embeddings, {
        url: qdrantUrl,
        apiKey: qdrantApiKey, // Added API Key
        collectionName: collectionName,
    });

    // Clean up the uploaded file after indexing
    if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
    }

    return {
        success: true,
        documentCount: docs.length,
        collectionName: collectionName,
    };
}

/**
 * Index multiple PDF documents into Qdrant vector store
 * @param {Array<{filepath: string, name: string, source: string}>} files - Array of file info
 * @param {string} category - Document category
 * @returns {Promise<{success: boolean, results: Array}>}
 */
export async function indexMultipleDocuments(files, category) {
    const results = [];

    for (const file of files) {
        const collectionName = generateCollectionName(category);
        try {
            const result = await indexDocument(file.filepath, collectionName, {
                source: file.source,
                category: category,
                name: file.name
            });
            results.push({
                ...result,
                name: file.name,
                category: category
            });
        } catch (error) {
            results.push({
                success: false,
                name: file.name,
                error: error.message
            });
            // Clean up file on error
            if (fs.existsSync(file.filepath)) {
                fs.unlinkSync(file.filepath);
            }
        }
    }

    return {
        success: results.every(r => r.success),
        results: results
    };
}

/**
 * Delete a collection from Qdrant
 * @param {string} collectionName - Name of the collection to delete
 * @returns {Promise<{success: boolean}>}
 */
export async function deleteCollection(collectionName) {
    const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";

    const response = await fetch(`${qdrantUrl}/collections/${collectionName}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        throw new Error(`Failed to delete collection: ${response.statusText}`);
    }

    return { success: true };
}

/**
 * Get all collections for a specific category
 * @param {string} category - Document category
 * @returns {Promise<Array<string>>}
 */
export async function getCollectionsByCategory(category) {
    const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";

    const response = await fetch(`${qdrantUrl}/collections`);
    if (!response.ok) {
        throw new Error(`Failed to fetch collections: ${response.statusText}`);
    }

    const data = await response.json();
    const prefix = `medical-${category.toLowerCase()}`;

    return data.result.collections
        .map(c => c.name)
        .filter(name => name.startsWith(prefix));
}

/**
 * Index raw text content into Qdrant
 * @param {string} text - The text content to index
 * @param {string} collectionName - Name for the Qdrant collection
 * @param {Object} metadata - Metadata (source, category, sourceType, etc.)
 * @returns {Promise<{success: boolean, documentCount: number, collectionName: string}>}
 */
export async function indexTextContent(text, collectionName, metadata = {}) {
    const doc = new Document({
        pageContent: text,
        metadata: {
            source: metadata.source || "Unknown",
            category: metadata.category || "GENERAL",
            documentName: metadata.name || "Scraped Content",
            sourceType: metadata.sourceType || DataSourceTypeEnum.SCRAPED,
            sourceUrl: metadata.sourceUrl || "",
            siteName: metadata.siteName || ""
        }
    });

    const embeddings = getEmbeddings();
    const qdrantUrl = process.env.QDRANT_URL || "http://localhost:6333";
    const qdrantApiKey = process.env.QDRANT_API_KEY;

    await QdrantVectorStore.fromDocuments([doc], embeddings, {
        url: qdrantUrl,
        apiKey: qdrantApiKey,
        collectionName: collectionName,
    });

    return {
        success: true,
        documentCount: 1,
        collectionName: collectionName,
    };
}
