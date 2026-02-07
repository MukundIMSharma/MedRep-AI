import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { BaseScraper, cleanText, downloadFile } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const IPC_PVPI_URL = "https://ipc.gov.in/pvpi.html";

export class PvpiScraper extends BaseScraper {
    constructor() {
        super("PvPI", IPC_PVPI_URL, DocumentCategoryEnum.SAFETY);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Enhanced selector strategy
            // Try specific lists first, then fallback to generic links in content areas
            const selectors = [
                "ul.news-list li",
                "table.alerts-table tr",
                ".content-area a",
                ".marquee a",
                "a" // Fallback: check all links for keywords
            ];

            // Use a Set to track seen links/titles to avoid duplicates
            const seen = new Set();

            const elements = $("a, li, tr").toArray();

            for (const el of elements) {
                const text = cleanText($(el).text());
                const link = $(el).find('a').attr('href') || $(el).attr('href');

                // Filter for relevant keywords
                if (text && text.length > 10 && (text.toLowerCase().includes("alert") || text.toLowerCase().includes("safety") || text.toLowerCase().includes("advisory") || text.toLowerCase().includes("notice"))) {
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, this.baseUrl).href) : this.baseUrl;
                    const uniqueKey = text + fullLink;

                    if (!seen.has(uniqueKey)) {
                        seen.add(uniqueKey);

                        let content = `Safety Alert: ${text}\nLink: ${fullLink}\nSource: Pharmacovigilance Programme of India`;
                        let isPdf = false;
                        let pdfText = "";

                        // Deep Scraping: Download PDF if available
                        if (fullLink.toLowerCase().endsWith(".pdf")) {
                            try {
                                const filename = `pvpi_${Date.now()}_${results.length}.pdf`;
                                const tempPath = path.resolve("temp", filename);

                                if (!fs.existsSync(path.resolve("temp"))) fs.mkdirSync(path.resolve("temp"));

                                this.log(`Downloading PDF: ${text.substring(0, 30)}...`);
                                await downloadFile(fullLink, tempPath);

                                const loader = new PDFLoader(tempPath, { splitPages: false });
                                const docs = await loader.load();
                                pdfText = docs.map(d => d.pageContent).join("\n").substring(0, 5000);

                                content = `Safety Alert: ${text}\n\nExtracted PDF Content:\n${pdfText}...\n\nLink: ${fullLink}`;
                                isPdf = true;
                                fs.unlinkSync(tempPath);
                            } catch (err) {
                                console.warn(`Failed to process PDF for ${text}: ${err.message}`);
                            }
                        }

                        results.push({
                            title: `PvPI Safety Alert: ${text.substring(0, 50)}...`,
                            content: content,
                            sourceUrl: fullLink,
                            metadata: {
                                category: this.category,
                                sourceType: isPdf ? DataSourceTypeEnum.UPLOADED : DataSourceTypeEnum.SCRAPED,
                                siteName: "PvPI",
                                source: "Pharmacovigilance Programme of India",
                                name: "Safety Alert",
                                externalLink: fullLink,
                                isPdf: isPdf
                            }
                        });
                    }
                }
            }

            this.log(`Found ${results.length} safety alerts.`);
            return results.slice(0, 10); // Limit to 10 relevant items
        } catch (error) {
            this.error("Failed to scrape PvPI", error);
            return [];
        }
    }
}

export const scrapePvpiAlerts = async () => {
    const scraper = new PvpiScraper();
    return scraper.scrape();
};
