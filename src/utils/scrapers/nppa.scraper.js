import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const NPPA_BASE_URL = "https://nppa.gov.in";
// Using homepage to catch marquee/latest updates
const NPPA_HOME_URL = "https://nppa.gov.in";

export class NppaScraper extends BaseScraper {
    constructor() {
        super("NPPA", NPPA_HOME_URL, DocumentCategoryEnum.PRICING);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            // Fetch homepage or specific search page
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Look for latest orders/notifications in marquee or specific lists
            $(".marquee a, .list-group-item a, table tr a").each((_, el) => {
                const text = cleanText($(el).text());
                const link = $(el).attr('href');

                if (text && text.length > 10 && (text.toLowerCase().includes("fixing") || text.toLowerCase().includes("ceiling") || text.toLowerCase().includes("retail price"))) {
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, this.baseUrl).href) : this.baseUrl;

                    results.push({
                        title: `NPPA Pricing: ${text.substring(0, 100)}...`,
                        content: `Notification: ${text}\nLink: ${fullLink}\nSource: NPPA`,
                        sourceUrl: fullLink,
                        metadata: {
                            category: this.category,
                            sourceType: DataSourceTypeEnum.SCRAPED,
                            siteName: "NPPA",
                            source: "National Pharmaceutical Pricing Authority",
                            name: "Price Notification",
                            externalLink: fullLink
                        }
                    });
                }
            });

            this.log(`Found ${results.length} pricing notifications.`);
            return results.slice(0, 10);
        } catch (error) {
            this.error("Failed to scrape NPPA", error);
            return [];
        }
    }
}

export const scrapeNppaPricing = async () => {
    const scraper = new NppaScraper();
    return scraper.scrape();
};
