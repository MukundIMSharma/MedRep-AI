import * as cheerio from "cheerio";
import { fetchHtml, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const NPPA_URL = "https://nppa.gov.in/ceiling-price-notifications/";

/**
 * Scrape NPPA Pricing Notifications
 * @returns {Promise<Array>}
 */
export async function scrapeNppaPricing() {
    console.log("Scraping NPPA Pricing...");
    try {
        const html = await fetchHtml(NPPA_URL);
        const $ = cheerio.load(html);
        const results = [];

        $("table tr").each((i, el) => {
            if (i === 0) return;
            const cols = $(el).find("td");
            if (cols.length >= 2) {
                const drugName = cleanText($(cols[1]).text());
                const priceMatch = cleanText($(cols[2]).text());

                if (drugName) {
                    results.push({
                        title: `NPPA Ceiling Price: ${drugName}`,
                        content: `Drug: ${drugName}\nCeiling Price Notification: ${priceMatch}`,
                        sourceUrl: NPPA_URL,
                        metadata: {
                            category: DocumentCategoryEnum.PRICING,
                            sourceType: DataSourceTypeEnum.SCRAPED,
                            siteName: "NPPA",
                            source: "National Pharmaceutical Pricing Authority",
                            name: drugName
                        }
                    });
                }
            }
        });

        return results.slice(0, 5);
    } catch (error) {
        console.error("Error occurred while scraping from NPPA:", error.message);
        return [];
    }
}
