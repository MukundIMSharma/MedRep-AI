import { scrapeCdscoNewDrugs } from "../utils/scrapers/cdsco.scraper.js";
import { scrapePvpiAlerts } from "../utils/scrapers/pvpi.scraper.js";
import { scrapeCtriTrials } from "../utils/scrapers/ctri.scraper.js";
import { scrapeClinicalTrials } from "../utils/scrapers/clinicaltrials.scraper.js";
import { scrapeAdvertisingRules } from "../utils/scrapers/advertising.scraper.js";
import { scrapeIrdaiCirculars } from "../utils/scrapers/irdai.scraper.js";
import { scrapePubmedPapers } from "../utils/scrapers/pubmed.scraper.js";
import { scrapeMedicalBooks } from "../utils/scrapers/openlibrary.scraper.js";
import { scrapeFssaiRegulations } from "../utils/scrapers/fssai.scraper.js";

async function testScraper(name, scraperFn) {
    console.log(`\n--- Testing ${name} ---`);
    try {
        const start = Date.now();
        const results = await scraperFn();
        const duration = Date.now() - start;

        console.log(`[${name}] Found ${results.length} items.`);

        if (results.length > 0) {
            console.log(`✅ ${name} completed in ${duration}ms`);
            console.log(`Found ${results.length} items`);
            console.log("Sample item:", JSON.stringify(results[0], null, 2));
        } else {
            console.warn(`⚠️ ${name} returned 0 items. Check selectors or connection.`);
            console.log(`✅ ${name} completed in ${duration}ms`);
            console.log(`Found ${results.length} items`);
        }
    } catch (error) {
        console.error(`❌ ${name} failed:`, error.message);
    }
}

async function runTests() {
    console.log("Starting Scraper Verification...");

    const scrapers = [
        ["CDSCO", scrapeCdscoNewDrugs],
        ["PvPI", scrapePvpiAlerts],
        ["CTRI", scrapeCtriTrials],
        ["ClinicalTrials.gov", scrapeClinicalTrials],
        ["Advertising/ASCI", scrapeAdvertisingRules],
        ["IRDAI (PDFs)", scrapeIrdaiCirculars],
        ["PubMed", scrapePubmedPapers],
        ["OpenLibrary", scrapeMedicalBooks],
        ["FSSAI", scrapeFssaiRegulations]
    ];

    for (const [name, fn] of scrapers) {
        await testScraper(name, fn);
    }

    console.log("\nVerification Complete.");
}

runTests();
