import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

// Switching to the main DHR link which is stable, as the subdomain often has DNS issues from external networks
const HTAIN_URL = "https://dhr.gov.in/health-technology-assessment";

export class HtainScraper extends BaseScraper {
    constructor() {
        super("HTAIn", HTAIN_URL, DocumentCategoryEnum.HTA);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Scrape report list
            $("table tr, .k2ItemsBlock li").each((_, el) => {
                // Try multiple strategies
                const linkEl = $(el).find("a");
                const text = cleanText(linkEl.text()) || cleanText($(el).text());
                const link = linkEl.attr('href');

                if (text && text.length > 10 && (text.toLowerCase().includes("report") || text.toLowerCase().includes("assessment"))) {
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, "https://htain.icmr.org.in").href) : this.baseUrl;

                    results.push({
                        title: `HTAIn Report: ${text.substring(0, 100)}...`,
                        content: `Report Title: ${text}\nLink: ${fullLink}\nSource: HTAIn`,
                        sourceUrl: fullLink,
                        metadata: {
                            category: this.category,
                            sourceType: DataSourceTypeEnum.SCRAPED,
                            siteName: "HTAIn",
                            source: "Health Technology Assessment in India",
                            name: "HTA Study",
                            reportUrl: fullLink
                        }
                    });
                }
            });

            this.log(`Found ${results.length} HTA reports.`);
            return results;
        } catch (error) {
            this.error("Failed to scrape HTAIn", error);
            return [];
        }
    }
}

export const scrapeHtainReports = async () => {
    const scraper = new HtainScraper();
    return scraper.scrape();
};
