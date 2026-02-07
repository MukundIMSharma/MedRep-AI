import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { BaseScraper, cleanText, downloadFile } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const CDSCO_BASE_URL = "https://cdsco.gov.in";
const NOTIFICATIONS_URL = "https://cdsco.gov.in/opencms/opencms/en/Notifications/Public-Notices/";

export class CdscoScraper extends BaseScraper {
    constructor() {
        super("CDSCO", NOTIFICATIONS_URL, DocumentCategoryEnum.APPROVAL);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Scrape table rows in the public notices section
            $("table tr, .common-table tr").each((i, el) => {
                if (i === 0) return; // Skip header

                const cols = $(el).find("td");
                if (cols.length >= 2) {
                    // Adjust indices based on typical table: [S.No, Subject/Title, Date/File]
                    // Sometimes columns vary, so checking content is key
                    const col1 = cleanText($(cols[1]).text());
                    const col2 = cleanText($(cols[2]).text());

                    const subject = col1.length > 10 ? col1 : col2;
                    const date = col1.length > 10 ? cleanText($(cols[2]).text()) || cleanText($(cols[0]).text()) : cleanText($(cols[3]).text());

                    const link = $(el).find("a").attr("href");

                    if (subject && subject.length > 5) {
                        const fullLink = link ? (link.startsWith("http") ? link : new URL(link, CDSCO_BASE_URL).href) : this.baseUrl;

                        results.push({
                            title: `CDSCO Notice: ${subject.substring(0, 100)}...`,
                            content: `Subject: ${subject}\nDate: ${date}\nLink: ${fullLink}\nSource: CDSCO Public Notices`,
                            sourceUrl: fullLink,
                            metadata: {
                                category: this.category,
                                sourceType: DataSourceTypeEnum.SCRAPED,
                                siteName: "CDSCO",
                                source: "CDSCO Official Portal",
                                name: subject.substring(0, 50),
                                notificationDate: date
                            }
                        });
                    }
                }
            });

            this.log(`Found ${results.length} new CDSCO notices.`);
            return results;
        } catch (error) {
            this.error("Failed to scrape CDSCO", error);
            return [];
        }
    }
}

export const scrapeCdscoNewDrugs = async () => {
    const scraper = new CdscoScraper();
    return scraper.scrape();
};
