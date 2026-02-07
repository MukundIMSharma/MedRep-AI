import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const NHA_BASE_URL = "https://nha.gov.in";
// Official About page with scheme details (verified)
const NHA_PMJAY_URL = "https://pmjay.gov.in/about-pmjay";

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

            // Targeting headers and content sections on the verified about page
            $(".about-pmjay-sec h2, .about-pmjay-sec h3, .about-pmjay-sec p, .pmjay-benefit p, .content-area p, .entry-content p").each((_, el) => {
                const text = cleanText($(el).text());

                if (text.length > 30 && (
                    text.toLowerCase().includes("lakh") ||
                    text.toLowerCase().includes("family") ||
                    text.toLowerCase().includes("cover") ||
                    text.toLowerCase().includes("benefit") ||
                    text.toLowerCase().includes("secondary") ||
                    text.toLowerCase().includes("tertiary")
                )) {

                    // Avoid duplicates in the same run
                    if (!results.some(r => r.content.includes(text.substring(0, 40)))) {
                        results.push({
                            title: `Ayushman Bharat (PM-JAY) Info: ${text.substring(0, 60)}...`,
                            content: `Scheme Detail: ${text}\nSource: PM-JAY Official Portal`,
                            sourceUrl: this.baseUrl,
                            metadata: {
                                category: this.category,
                                sourceType: DataSourceTypeEnum.SCRAPED,
                                siteName: "NHA-PMJAY",
                                source: "National Health Authority",
                                name: "PM-JAY Scheme Info"
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
