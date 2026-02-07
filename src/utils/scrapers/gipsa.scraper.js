import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

// Using NIC Circulars as they are the leads for GIPSA PPN in many zones and keep list updates public
const GIPSA_URL = "https://nationalinsurance.nic.co.in/en/circulars";

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

            // Scrape circulars table for PPN or Rate related updates
            $("table tr").each((_, el) => {
                const text = cleanText($(el).text());

                if (text && text.length > 20 && (text.toLowerCase().includes("ppn") || text.toLowerCase().includes("rate") || text.toLowerCase().includes("hospital"))) {
                    const link = $(el).find('a').attr('href');
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, "https://nationalinsurance.nic.co.in").href) : this.baseUrl;

                    const title = text.split("\n")[0].trim().substring(0, 100);

                    results.push({
                        title: `GIPSA/NIC Update: ${title}`,
                        content: `Update: ${text}\nLink: ${fullLink}\nSource: National Insurance (GIPSA)`,
                        sourceUrl: fullLink,
                        metadata: {
                            category: this.category,
                            sourceType: DataSourceTypeEnum.SCRAPED,
                            siteName: "NIC/GIPSA",
                            source: "National Insurance General Insurance (GIPSA)",
                            name: title
                        }
                    });
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
