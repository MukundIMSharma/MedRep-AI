import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

// GIPSA PPN details are often hosted on TPA sites or specific GIPSA portals. 
// Using National Insurance Company's PPN page as a reliable proxy for GIPSA PPN list
const GIPSA_URL = "https://nationalinsurance.nic.co.in/en/ppn-hospital-network";

export class GipsaScraper extends BaseScraper {
    constructor() {
        super("GIPSA", GIPSA_URL, DocumentCategoryEnum.REIMBURSEMENT);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Scrape accessible text about PPN or links to PPN lists
            $(".node-content p, .region-content li, table tr").each((_, el) => {
                const text = cleanText($(el).text());

                if (text && text.length > 50 && (text.toLowerCase().includes("ppn") || text.toLowerCase().includes("package") || text.toLowerCase().includes("rate"))) {
                    // Check for PDF links to actual rate cards
                    const link = $(el).find('a').attr('href');
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, "https://uiic.co.in").href) : this.baseUrl;

                    if (!results.some(r => r.content.includes(text.substring(0, 30)))) {
                        results.push({
                            title: `GIPSA PPN Info: ${text.substring(0, 50)}...`,
                            content: `GIPSA PPN Guideline: ${text}\nLink: ${fullLink}\nSource: Public Sector General Insurance (UIIC/GIPSA)`,
                            sourceUrl: fullLink,
                            metadata: {
                                category: this.category,
                                sourceType: DataSourceTypeEnum.SCRAPED,
                                siteName: "GIPSA/UIIC",
                                source: "Public Sector General Insurance (GIPSA)",
                                name: "PPN Guideline",
                                externalLink: fullLink
                            }
                        });
                    }
                }
            });

            this.log(`Found ${results.length} GIPSA PPN references.`);
            return results;
        } catch (error) {
            this.error("Failed to scrape GIPSA", error);
            return [];
        }
    }
}

export const scrapeGipsaPpn = async () => {
    const scraper = new GipsaScraper();
    return scraper.scrape();
};
