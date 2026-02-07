import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

// Dedicated stable link for completed studies
const HTAIN_URL = "https://htain.dhr.gov.in/completed-hta-studies.php";

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

            // Scrape table rows from the specific completed studies page
            $("table tbody tr").each((_, el) => {
                const cols = $(el).find("td");
                if (cols.length >= 2) {
                    const title = cleanText($(cols[1]).text());
                    const linkEl = $(cols[2]).find("a");
                    const link = linkEl.attr('href');

                    if (title && title.length > 5) {
                        const fullLink = link ? (link.startsWith("http") ? link : new URL(link, "https://htain.dhr.gov.in").href) : this.baseUrl;

                        results.push({
                            title: `HTAIn Report: ${title.substring(0, 100)}`,
                            content: `HTA Study Title: ${title}\nReport/Link: ${fullLink}\nSource: Health Technology Assessment in India (DHR/ICMR)`,
                            sourceUrl: fullLink,
                            metadata: {
                                category: this.category,
                                sourceType: DataSourceTypeEnum.SCRAPED,
                                siteName: "HTAIn",
                                source: "Health Technology Assessment in India",
                                name: title.substring(0, 50)
                            }
                        });
                    }
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
