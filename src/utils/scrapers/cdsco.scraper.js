import * as cheerio from "cheerio";
import { fetchHtml, cleanText } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const CDSCO_BASE_URL = "https://cdsco.gov.in";
const NEW_DRUGS_URL = "https://cdsco.gov.in/opencms/opencms/en/Approval_and_Registration/Drugs/List-of-Approved-New-Drugs/";

/**
 * Scrape CDSCO Approved New Drugs list
 * @returns {Promise<Array<{title: string, content: string, sourceUrl: string, metadata: Object}>>}
 */
export async function scrapeCdscoNewDrugs() {
    console.log("Scraping CDSCO New Drugs...");
    try {
        const html = await fetchHtml(NEW_DRUGS_URL);
        const $ = cheerio.load(html);
        const results = [];

        // Typically CDSCO has tables or lists of links to PDFs
        // We'll scrape the main table rows or list items
        $("table tr").each((i, el) => {
            if (i === 0) return; // Skip header

            const cols = $(el).find("td");
            if (cols.length >= 2) {
                const drugName = cleanText($(cols[1]).text());
                const date = cleanText($(cols[2]).text());
                const indication = cleanText($(cols[3]).text());

                if (drugName) {
                    results.push({
                        title: `CDSCO Approval: ${drugName}`,
                        content: `Drug Name: ${drugName}\nApproval Date: ${date}\nIndication: ${indication}`,
                        sourceUrl: NEW_DRUGS_URL,
                        metadata: {
                            category: DocumentCategoryEnum.APPROVAL,
                            sourceType: DataSourceTypeEnum.SCRAPED,
                            siteName: "CDSCO",
                            source: "CDSCO Official Portal",
                            name: drugName
                        }
                    });
                }
            }
        });

        // Limit results for initial implementation
        return results.slice(0, 5);
    } catch (error) {
        console.error("Error occurred while scraping from CDSCO:", error.message);
        return [];
    }
}
