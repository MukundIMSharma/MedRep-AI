import * as cheerio from "cheerio";
import { fetchHtml, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const IPC_PVPI_URL = "https://ipc.gov.in/pvpi.html";

/**
 * Scrape IPC/PvPI Safety Alerts
 * @returns {Promise<Array>}
 */
export async function scrapePvpiAlerts() {
    console.log("Scraping PvPI Safety Alerts...");
    try {
        const html = await fetchHtml(IPC_PVPI_URL);
        const $ = cheerio.load(html);
        const results = [];

        // Scrape updates or notices
        $("ul.news-list li, table.alerts-table tr").each((_, el) => {
            const text = cleanText($(el).text());
            if (text.toLowerCase().includes("alert") || text.toLowerCase().includes("safety")) {
                results.push({
                    title: `PvPI Safety Alert`,
                    content: text,
                    sourceUrl: IPC_PVPI_URL,
                    metadata: {
                        category: DocumentCategoryEnum.SAFETY,
                        sourceType: DataSourceTypeEnum.SCRAPED,
                        siteName: "PvPI",
                        source: "Pharmacovigilance Programme of India",
                        name: "Safety Alert"
                    }
                });
            }
        });

        return results.slice(0, 5);
    } catch (error) {
        console.error("Error occurred while scraping from PvPI:", error.message);
        return [];
    }
}
