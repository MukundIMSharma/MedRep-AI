import * as cheerio from "cheerio";
import { fetchHtml, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const HTAIN_URL = "https://htain.dhr.gov.in/published-reports/";

/**
 * Scrape HTAIn Published Reports
 * @returns {Promise<Array>}
 */
export async function scrapeHtainReports() {
    console.log("Scraping HTAIn Reports...");
    try {
        const html = await fetchHtml(HTAIN_URL);
        const $ = cheerio.load(html);
        const results = [];

        $(".report-item, .entry-title").each((_, el) => {
            const title = cleanText($(el).text());
            if (title) {
                results.push({
                    title: `HTAIn Report: ${title}`,
                    content: `Health Technology Assessment Report: ${title}`,
                    sourceUrl: HTAIN_URL,
                    metadata: {
                        category: DocumentCategoryEnum.HTA,
                        sourceType: DataSourceTypeEnum.SCRAPED,
                        siteName: "HTAIn",
                        source: "Health Technology Assessment in India",
                        name: title
                    }
                });
            }
        });

        return results.slice(0, 5);
    } catch (error) {
        console.error("Error occurred while scraping from HTAIn:", error.message);
        return [];
    }
}
