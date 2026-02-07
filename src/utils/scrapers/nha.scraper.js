import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const NHA_BASE_URL = "https://nha.gov.in";
// Switching to PMJAY specific text content which is often more reliable
const NHA_PMJAY_URL = "https://pmjay.gov.in/about/pmjay";

export class NhaScraper extends BaseScraper {
    constructor() {
        super("NHA", NHA_PMJAY_URL, DocumentCategoryEnum.REIMBURSEMENT);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Targeting cards or content sections often found on NHA pages
            $(".pm-jay-card, .abt-pmjay p, .pm-jay-text p").each((_, el) => {
                const text = cleanText($(el).text());

                if (text.length > 50 && (text.includes("cover") || text.includes("family") || text.includes("hospital") || text.includes("benefit"))) {

                    // Avoid distinct duplicates
                    if (!results.some(r => r.content.includes(text.substring(0, 30)))) {
                        results.push({
                            title: `Ayushman Bharat Scheme Details`,
                            content: `Scheme Info: ${text}\nSource: National Health Authority`,
                            sourceUrl: this.baseUrl,
                            metadata: {
                                category: this.category,
                                sourceType: DataSourceTypeEnum.SCRAPED,
                                siteName: "NHA",
                                source: "National Health Authority",
                                name: "Ayushman Bharat Info"
                            }
                        });
                    }
                }
            });

            this.log(`Found ${results.length} NHA items.`);
            return results;
        } catch (error) {
            this.error("Failed to scrape NHA", error);
            // Fallback to scraping the homepage if deep link fails
            if (this.baseUrl !== NHA_BASE_URL) {
                this.log("Retrying with base URL...");
                this.baseUrl = NHA_BASE_URL;
                return this.scrape();
            }
            return [];
        }
    }
}

export const scrapeNhaSchemes = async () => {
    const scraper = new NhaScraper();
    return scraper.scrape();
};
