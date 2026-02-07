import { indexTextContent } from "./vectorStore.service.js";
import { MedicalDocument } from "../models/medicalDocument.model.js";
import { generateCollectionName } from "./vectorStore.service.js";

// Import all scrapers
import { scrapeCdscoNewDrugs } from "../utils/scrapers/cdsco.scraper.js";
import { scrapeNhaSchemes } from "../utils/scrapers/nha.scraper.js";
import { scrapePvpiAlerts } from "../utils/scrapers/pvpi.scraper.js";
import { scrapeNppaPricing } from "../utils/scrapers/nppa.scraper.js";
import { scrapeHtainReports } from "../utils/scrapers/htain.scraper.js";
import { scrapeCtriTrials } from "../utils/scrapers/ctri.scraper.js";
import { scrapeMohfwGuidelines } from "../utils/scrapers/mohfw.scraper.js";
import { scrapeClinicalTrials } from "../utils/scrapers/clinicaltrials.scraper.js";
import { scrapeAdvertisingRules } from "../utils/scrapers/advertising.scraper.js";
import { scrapeIrdaiCirculars } from "../utils/scrapers/irdai.scraper.js";
import { scrapeGipsaPpn } from "../utils/scrapers/gipsa.scraper.js";
import { scrapePubmedPapers } from "../utils/scrapers/pubmed.scraper.js";
import { scrapeMedicalBooks } from "../utils/scrapers/openlibrary.scraper.js";

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
        scrapeHtainReports,
        scrapeCtriTrials,
        scrapeMohfwGuidelines,
        scrapeClinicalTrials,
        scrapeAdvertisingRules,
        scrapeIrdaiCirculars,
        scrapeGipsaPpn,
        scrapePubmedPapers,
        scrapeMedicalBooks
    ];

    const allResults = [];

    for (const scraper of scrapers) {
        try {
            const scraperName = scraper.name;
            console.log(`Running scraper: ${scraperName}...`);

            const scrapedData = await scraper();
            console.log(`Scraper ${scraperName} found ${scrapedData.length} items`);

            // Limit the number of items processed to save storage (User Request)
            const MAX_ITEMS_PER_SOURCE = 30;
            const itemsToProcess = scrapedData.slice(0, MAX_ITEMS_PER_SOURCE);

            if (itemsToProcess.length < scrapedData.length) {
                console.log(`⚠️ Limiting ${scraperName} to top ${MAX_ITEMS_PER_SOURCE} items (Storage Optimization).`);
            }

            for (const item of itemsToProcess) {
                try {
                    const collectionName = generateCollectionName(item.metadata.category);

                    // Add timestamp to metadata
                    const enrichedMetadata = {
                        ...item.metadata,
                        scrapedAt: new Date().toISOString(),
                        sourceUrl: item.sourceUrl
                    };

                    // Index in Vector Store
                    await indexTextContent(item.content, collectionName, enrichedMetadata);

                    // Save Metadata in MongoDB
                    // Check if document already exists to avoid duplicates (based on title/sourceUrl)
                    const existingDoc = await MedicalDocument.findOne({
                        sourceUrl: item.sourceUrl,
                        name: item.title
                    });

                    if (!existingDoc) {
                        await MedicalDocument.create({
                            name: item.title,
                            category: item.metadata.category,
                            collectionName: collectionName,
                            source: item.metadata.source,
                            sourceType: item.metadata.sourceType,
                            sourceUrl: item.sourceUrl,
                            description: item.content.substring(0, 500), // Increased length
                            uploadedBy: "67a7767379994b18bbd6b789", // Placeholder
                            metadata: enrichedMetadata
                        });
                        allResults.push({ success: true, title: item.title, action: "created" });
                    } else {
                        // Optional: Update if content changed, for now just skip
                        console.log(`Document ${item.title} already exists. Skipping DB creation.`);
                        allResults.push({ success: true, title: item.title, action: "skipped" });
                    }

                } catch (innerError) {
                    console.error(`Error processing item ${item.title}:`, innerError.message);
                    allResults.push({ success: false, title: item.title, error: innerError.message });
                }
            }
        } catch (error) {
            console.error(`Scraper execution error: ${error.message}`);
        }
    }

    console.log("Scraping Pipeline Completed.");
    return allResults;
}
