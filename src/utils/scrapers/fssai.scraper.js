import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { BaseScraper, cleanText, downloadFile } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const FSSAI_URL = "https://www.fssai.gov.in/cms/food-safety-and-standards-regulations.php";

export class FssaiScraper extends BaseScraper {
    constructor() {
        super("FSSAI", FSSAI_URL, DocumentCategoryEnum.GUIDELINE);
    }

    async scrape() {
        this.log("Starting scrape...");
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);
            const results = [];

            // Targeted scraping for FSSAI regulations links
            // Usually in tables or lists with PDF links
            $("table tr, .cms-content li, .regulations-list li").each((_, el) => {
                const linkEl = $(el).find("a");
                const text = cleanText(linkEl.text()) || cleanText($(el).text());
                const link = linkEl.attr('href');

                // Filter specifically for "Regulation" or "Act" or "Amendment"
                if (text && text.length > 20 && (text.toLowerCase().includes("regulation") || text.toLowerCase().includes("standard") || text.toLowerCase().includes("amendment"))) {
                    const fullLink = link ? (link.startsWith("http") ? link : new URL(link, "https://www.fssai.gov.in").href) : this.baseUrl;

                    // Avoid duplicate entries if title is identical
                    if (!results.some(r => r.title === `FSSAI Regulation: ${text.substring(0, 50)}...`)) {
                        let content = `FSSAI Regulation/Act: ${text}\nLink: ${fullLink}\nSource: Food Safety and Standards Authority of India`;
                        let isPdf = false;
                        let pdfText = "";

                        // Deep Scraping: Download PDF if available
                        if (fullLink.toLowerCase().endsWith(".pdf")) {
                            try {
                                const filename = `fssai_${Date.now()}_${results.length}.pdf`;
                                const tempPath = path.resolve("temp", filename);

                                // Ensure temp dir exists
                                if (!fs.existsSync(path.resolve("temp"))) {
                                    fs.mkdirSync(path.resolve("temp"));
                                }

                                this.log(`Downloading PDF: ${text.substring(0, 30)}...`);
                                await downloadFile(fullLink, tempPath);

                                const loader = new PDFLoader(tempPath, { splitPages: false });
                                const docs = await loader.load();
                                pdfText = docs.map(d => d.pageContent).join("\n").substring(0, 5000); // Capture up to 5000 chars

                                content = `FSSAI Regulation/Act: ${text}\n\nExtracted PDF Content:\n${pdfText}...\n\nLink: ${fullLink}`;
                                isPdf = true;

                                fs.unlinkSync(tempPath); // Cleanup
                            } catch (err) {
                                console.warn(`Failed to download/parse PDF for ${text}: ${err.message}`);
                                content += `\n(PDF Download Failed: ${err.message})`;
                            }
                        }

                        results.push({
                            title: `FSSAI Regulation: ${text.substring(0, 100)}...`,
                            content: content,
                            sourceUrl: fullLink,
                            metadata: {
                                category: this.category,
                                sourceType: isPdf ? DataSourceTypeEnum.UPLOADED : DataSourceTypeEnum.SCRAPED,
                                siteName: "FSSAI",
                                source: "Food Safety and Standards Authority of India",
                                name: "Food Safety Regulation",
                                externalLink: fullLink,
                                isPdf: isPdf
                            }
                        });
                    }
                }
            });

            this.log(`Found ${results.length} FSSAI regulations.`);
            return results.slice(0, 10); // Limit to top 10 relevant
        } catch (error) {
            this.error("Failed to scrape FSSAI", error);
            // Fallback content if site structure changes or is blocked
            return [{
                title: "FSSAI Regulations Page",
                content: "Food Safety and Standards Regulations are available on the official website.\nLink: https://www.fssai.gov.in/cms/food-safety-and-standards-regulations.php\nSource: FSSAI",
                sourceUrl: this.baseUrl,
                metadata: {
                    category: this.category,
                    sourceType: DataSourceTypeEnum.REFERENCE,
                    siteName: "FSSAI",
                    source: "FSSAI",
                    name: "Regulations Home"
                }
            }];
        }
    }
}

export const scrapeFssaiRegulations = async () => {
    const scraper = new FssaiScraper();
    return scraper.scrape();
};
