import { indexTextContent } from "./vectorStore.service.js";
import { MedicalDocument } from "../models/medicalDocument.model.js";
import { scrapeCdscoNewDrugs } from "../utils/scrapers/cdsco.scraper.js";
import { scrapeNhaSchemes } from "../utils/scrapers/nha.scraper.js";
import { scrapePvpiAlerts } from "../utils/scrapers/pvpi.scraper.js";
import { scrapeNppaPricing } from "../utils/scrapers/nppa.scraper.js";
import { scrapeHtainReports } from "../utils/scrapers/htain.scraper.js";
import { generateCollectionName } from "./vectorStore.service.js";

/**
 * Orchestrate scraping jobs for all configured sources
 */
export async function runScrapingPipeline() {
    console.log("Starting Scraping Pipeline...");

    const scrapers = [
        scrapeCdscoNewDrugs,
        scrapeNhaSchemes,
        scrapePvpiAlerts,
        scrapeNppaPricing,
        scrapeHtainReports
    ];

    const allResults = [];

    for (const scraper of scrapers) {
        try {
            const scrapedData = await scraper();
            console.log(`Scraper ${scraper.name} found ${scrapedData.length} items`);

            for (const item of scrapedData) {
                const collectionName = generateCollectionName(item.metadata.category);

                // Index in Vector Store
                await indexTextContent(item.content, collectionName, {
                    ...item.metadata,
                    source: item.metadata.source,
                    sourceUrl: item.sourceUrl
                });

                // Save Metadata in MongoDB
                await MedicalDocument.create({
                    name: item.title,
                    category: item.metadata.category,
                    collectionName: collectionName,
                    source: item.metadata.source,
                    sourceType: item.metadata.sourceType,
                    sourceUrl: item.sourceUrl,
                    description: item.content.substring(0, 200),
                    uploadedBy: "67a7767379994b18bbd6b789" // Placeholder for system/admin user ID
                });

                allResults.push({ success: true, title: item.title });
            }
        } catch (error) {
            console.error(`Scraper error: ${error.message}`);
        }
    }

    return allResults;
}
