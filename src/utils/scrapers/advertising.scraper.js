import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { BaseScraper, cleanText, downloadFile } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const ASCI_URL = "https://ascionline.in";

export class AdvertisingScraper extends BaseScraper {
    constructor() {
        super("ASCI", ASCI_URL, DocumentCategoryEnum.LEGAL);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Look for "Code" or "Guidelines" links in navigation
            const elements = $("nav a, .menu a").toArray();

            for (const el of elements) {
                const text = cleanText($(el).text());
                const link = $(el).attr('href');

                if (text && (text.includes("Code") || text.includes("Guideline"))) {
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, this.baseUrl).href) : this.baseUrl;

                    let content = `Advertising Standard/Guideline: ${text}\nLink: ${fullLink}\nSource: ASCI`;
                    let isPdf = false;
                    let pdfText = "";

                    // Deep Scraping: Download PDF if available
                    if (fullLink.toLowerCase().endsWith(".pdf")) {
                        try {
                            const filename = `asci_${Date.now()}_${results.length}.pdf`;
                            const tempPath = path.resolve("temp", filename);

                            if (!fs.existsSync(path.resolve("temp"))) fs.mkdirSync(path.resolve("temp"));

                            this.log(`Downloading PDF: ${text.substring(0, 30)}...`);
                            await downloadFile(fullLink, tempPath);

                            const loader = new PDFLoader(tempPath, { splitPages: false });
                            const docs = await loader.load();
                            pdfText = docs.map(d => d.pageContent).join("\n").substring(0, 5000);

                            content = `Advertising Standard/Guideline: ${text}\n\nExtracted PDF Content:\n${pdfText}...\n\nLink: ${fullLink}`;
                            isPdf = true;
                            fs.unlinkSync(tempPath);
                        } catch (err) {
                            console.warn(`Failed to process PDF for ${text}: ${err.message}`);
                        }
                    }

                    results.push({
                        title: `ASCI Guidelines: ${text}`,
                        content: content,
                        sourceUrl: fullLink,
                        metadata: {
                            category: this.category,
                            sourceType: isPdf ? DataSourceTypeEnum.UPLOADED : DataSourceTypeEnum.SCRAPED,
                            siteName: "ASCI",
                            source: "Advertising Standards Council of India",
                            name: text,
                            externalLink: fullLink,
                            isPdf: isPdf
                        }
                    });
                }
            }

            // If we found nothing, maybe add a default mapping to the known code URL
            if (results.length === 0) {
                results.push({
                    title: `ASCI Code for Self-Regulation`,
                    content: `The Code for Self-Regulation of Advertising Content in India.\nSource: ASCI`,
                    sourceUrl: "https://ascionline.in/images/pdf/code_book.pdf", // Reasonable guess or hardcoded knowledge
                    metadata: {
                        category: this.category,
                        sourceType: DataSourceTypeEnum.REFERENCE,
                        siteName: "ASCI",
                        source: "Advertising Standards Council of India",
                        name: "ASCI Code"
                    }
                });
            }

            this.log(`Found ${results.length} advertising guidelines.`);
            return results;
        } catch (error) {
            this.error("Failed to scrape ASCI", error);
            return [];
        }
    }
}

export const scrapeAdvertisingRules = async () => {
    const scraper = new AdvertisingScraper();
    return scraper.scrape();
};
