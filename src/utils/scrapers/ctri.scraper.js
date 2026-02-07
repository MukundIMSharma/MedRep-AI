import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const CTRI_BASE_URL = "https://ctri.nic.in/Clinicaltrials/login.php"; // Main landing often has stats or news

export class CtriScraper extends BaseScraper {
    constructor() {
        super("CTRI", CTRI_BASE_URL, DocumentCategoryEnum.TRIAL);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Check for marquee or news updates on the landing page
            // Or try to hit the public view if possible
            // Since CTRI is heavily form-based, we'll try to get ANY visible recent activity or defaults
            // If the main page doesn't list trials, we might just return a reference to the registry.

            // Attempt to find any links to specific trials if they appear on homepage
            $("a[href*='ViewTrial']").each((_, el) => {
                const text = cleanText($(el).text());
                const link = $(el).attr('href');
                if (text && text.length > 5) {
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, "https://ctri.nic.in/Clinicaltrials/").href) : this.baseUrl;

                    results.push({
                        title: `CTRI Trial Reference: ${text}`,
                        content: `Trial Reference: ${text}\nLink: ${fullLink}\nSource: CTRI`,
                        sourceUrl: fullLink,
                        metadata: {
                            category: this.category,
                            sourceType: DataSourceTypeEnum.SCRAPED,
                            siteName: "CTRI",
                            source: "Clinical Trials Registry - India",
                            name: text,
                            externalLink: fullLink
                        }
                    });
                }
            });

            // If no specific trials found (likely on homepage), return a general entry
            if (results.length === 0) {
                results.push({
                    title: `CTRI Registry Link`,
                    content: `Search for Clinical Trials in India on the official registry.\nLink: ${CTRI_BASE_URL}\nSource: CTRI`,
                    sourceUrl: CTRI_BASE_URL,
                    metadata: {
                        category: this.category,
                        sourceType: DataSourceTypeEnum.REFERENCE,
                        siteName: "CTRI",
                        source: "Clinical Trials Registry - India",
                        name: "Registry Search",
                        externalLink: CTRI_BASE_URL
                    }
                });
            }

            this.log(`Found ${results.length} CTRI references.`);
            return results;

        } catch (error) {
            this.error("Failed to scrape CTRI", error);
            return [];
        }
    }
}

export const scrapeCtriTrials = async () => {
    const scraper = new CtriScraper();
    return scraper.scrape();
};
