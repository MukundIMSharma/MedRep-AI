import * as cheerio from "cheerio";
import { fetchHtml, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const NHA_BASE_URL = "https://nha.gov.in";
// Placeholder for NHA schemes page
const NHA_SCHEMES_URL = "https://nha.gov.in/Ayushman-Bharat";

/**
 * Scrape NHA Reimbursement/Scheme information
 * @returns {Promise<Array>}
 */
export async function scrapeNhaSchemes() {
    console.log("Scraping NHA Schemes...");
    try {
        const html = await fetchHtml(NHA_SCHEMES_URL);
        const $ = cheerio.load(html);
        const results = [];

        // Scrape key highlight items or list items
        $(".content-area p, .content-area li").each((_, el) => {
            const text = cleanText($(el).text());
            if (text.length > 50) { // Only take substantial paragraphs
                results.push({
                    title: `NHA Scheme Info`,
                    content: text,
                    sourceUrl: NHA_SCHEMES_URL,
                    metadata: {
                        category: DocumentCategoryEnum.REIMBURSEMENT,
                        sourceType: DataSourceTypeEnum.SCRAPED,
                        siteName: "NHA",
                        source: "National Health Authority",
                        name: "Ayushman Bharat Scheme"
                    }
                });
            }
        });

        return results.slice(0, 5);
    } catch (error) {
        console.error("Error occurred while scraping from NHA:", error.message);
        return [];
    }
}
