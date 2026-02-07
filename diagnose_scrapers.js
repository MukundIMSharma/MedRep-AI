
import { scrapeCdscoNewDrugs } from "./src/utils/scrapers/cdsco.scraper.js";
import { scrapeNhaSchemes } from "./src/utils/scrapers/nha.scraper.js";
import fs from 'fs';

async function diagnose() {
    console.log("--- RUNTIME DIAGNOSIS ---");

    // Check scraper.service.js text directly
    try {
        const content = fs.readFileSync('./src/services/scraper.service.js', 'utf8');
        const limitMatch = content.match(/MAX_ITEMS_PER_SOURCE = (\d+)/);
        console.log(`File on disk limit: ${limitMatch ? limitMatch[1] : 'not found'}`);
        console.log(`File on disk log text: ${content.includes('User Requested Limit') ? 'New' : 'Old'}`);
    } catch (e) {
        console.error("Error reading scraper.service.js:", e.message);
    }

    // Check NHA Scraper URL
    try {
        const nhaContent = fs.readFileSync('./src/utils/scrapers/nha.scraper.js', 'utf8');
        console.log(`NHA URL on disk: ${nhaContent.includes('about-pmjay-scheme') ? 'New' : 'Old'}`);
    } catch (e) {
        console.error("Error reading nha.scraper.js:", e.message);
    }

    console.log("--- END DIAGNOSIS ---");
}

diagnose();
