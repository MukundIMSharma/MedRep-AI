import * as cheerio from "cheerio";
import { BaseScraper, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const MOHFW_URL = "https://main.mohfw.gov.in"; // Using 'main' subdomain if standard redirects are issues, or just standard. Let's try standard first with better headers, but actually main.mohfw.gov.in is the actual content site often.
// Let's stick to the official standard URL but be robust.
const MOHFW_TARGET_URL = "https://mohfw.gov.in";


export class MohfwScraper extends BaseScraper {
    constructor() {
        super("MoHFW", MOHFW_TARGET_URL, DocumentCategoryEnum.GUIDELINE);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Targeted selectors for "New" section or marquee
            // Also checking notification section if visible on homepage
            $(".polling_new li, .latest-news li, #site-dashboard li").each((_, el) => {
                const text = cleanText($(el).text());
                const link = $(el).find('a').attr('href');

                if (text && text.length > 10) {
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, this.baseUrl).href) : this.baseUrl;

                    results.push({
                        title: `MoHFW Notification: ${text.substring(0, 100)}...`,
                        content: `Notification: ${text}\nLink: ${fullLink}\nSource: MoHFW`,
                        sourceUrl: fullLink,
                        metadata: {
                            category: this.category,
                            sourceType: DataSourceTypeEnum.SCRAPED,
                            siteName: "MoHFW",
                            source: "Ministry of Health and Family Welfare",
                            name: "Notification",
                            externalLink: fullLink
                        }
                    });
                }
            });

            this.log(`Found ${results.length} MoHFW updates.`);
            return results;
        } catch (error) {
            this.error("Failed to scrape MoHFW", error);
            return [];
        }
    }
}

export const scrapeMohfwGuidelines = async () => {
    const scraper = new MohfwScraper();
    return scraper.scrape();
};
