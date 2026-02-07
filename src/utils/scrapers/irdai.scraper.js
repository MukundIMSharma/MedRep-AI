import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import * as cheerio from "cheerio";
import fs from "fs";
import path from "path";
import { BaseScraper, cleanText, downloadFile } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

const IRDAI_CIRCULARS_URL = "https://irdai.gov.in/circulars";

export class IrdaiScraper extends BaseScraper {
    constructor() {
        super("IRDAI", IRDAI_CIRCULARS_URL, DocumentCategoryEnum.LEGAL);
    }

    async scrape() {
        this.log("Starting scrape...");
        const results = [];
        try {
            const html = await this.fetch(this.baseUrl);
            const $ = cheerio.load(html);

            // Find links that likely point to PDFs
            const potentialPdfLinks = [];
            $("a").each((_, el) => {
                const href = $(el).attr('href');
                const text = cleanText($(el).text());
                if (href && (href.toLowerCase().endsWith(".pdf") || text.toLowerCase().includes("download") || text.toLowerCase().includes("master circular") || text.toLowerCase().includes("circular"))) {
                    // Capture ALL insurance-related PDFs (not just health)
                    // Look for keywords: insurance, circular, regulation, guideline, master, policy
                    const contextText = $(el).closest("tr").text().toLowerCase() + text.toLowerCase();
                    if (contextText.includes("insurance") || contextText.includes("circular") || contextText.includes("regulation") || contextText.includes("guideline") || contextText.includes("master") || contextText.includes("policy")) {
                        const fullLink = href.startsWith("http") ? href : new URL(href, "https://irdai.gov.in").href;
                        potentialPdfLinks.push({ url: fullLink, title: text || "IRDAI Document" });
                    }
                }
            });

            // If no specific links found on general page, add known Master Circular URLs
            if (potentialPdfLinks.length === 0) {
                potentialPdfLinks.push(
                    {
                        url: "https://irdai.gov.in/document-detail?documentId=5625747",
                        title: "Master Circular on Health Insurance Business 2024"
                    },
                    {
                        url: "https://irdai.gov.in/document-detail?documentId=5625748",
                        title: "Master Circular on Life Insurance Business 2024"
                    },
                    {
                        url: "https://irdai.gov.in/document-detail?documentId=5625749",
                        title: "Master Circular on General Insurance Business 2024"
                    }
                );
            }

            let processed = 0;
            for (const linkObj of potentialPdfLinks.slice(0, 10)) { // Increased limit to 10 PDFs
                try {
                    if (linkObj.url.toLowerCase().endsWith(".pdf") || linkObj.url.includes("documentId")) {
                        this.log(`Downloading or processing: ${linkObj.title}`);

                        // Check if it's a direct PDF link to download
                        if (linkObj.url.toLowerCase().endsWith(".pdf")) {
                            const filename = `irdai_${Date.now()}_${processed}.pdf`;
                            const tempPath = path.resolve("temp", filename);

                            // Ensure temp dir exists
                            if (!fs.existsSync(path.resolve("temp"))) {
                                fs.mkdirSync(path.resolve("temp"));
                            }

                            await downloadFile(linkObj.url, tempPath);

                            // Read PDF content using PDFLoader
                            // Using splitPages: false to get one document per file
                            const loader = new PDFLoader(tempPath, { splitPages: false });
                            const docs = await loader.load();
                            const pdfText = docs.map(d => d.pageContent).join("\n").substring(0, 3000); // Limit text

                            results.push({
                                title: `IRDAI Insurance PDF: ${linkObj.title}`,
                                content: `Source Document: ${linkObj.title}\n\nExtracted Content:\n${pdfText}...\n\nLink: ${linkObj.url}`,
                                sourceUrl: linkObj.url,
                                metadata: {
                                    category: this.category,
                                    sourceType: DataSourceTypeEnum.SCRAPED,
                                    siteName: "IRDAI",
                                    source: "IRDAI Official",
                                    name: linkObj.title,
                                    isPdf: true
                                }
                            });

                            // Cleanup
                            fs.unlinkSync(tempPath);
                            processed++;
                        } else {
                            // If it's not a direct PDF link (cms link), just index the link for now to avoid complex navigation
                            results.push({
                                title: `IRDAI Circular Link: ${linkObj.title}`,
                                content: `Title: ${linkObj.title}\nLink: ${linkObj.url}\nSource: IRDAI`,
                                sourceUrl: linkObj.url,
                                metadata: {
                                    category: this.category,
                                    sourceType: DataSourceTypeEnum.SCRAPED,
                                    siteName: "IRDAI",
                                    source: "IRDAI Official",
                                    name: linkObj.title
                                }
                            });
                        }
                    } else {
                        // Non-PDF link, just add as reference
                        results.push({
                            title: `IRDAI Link: ${linkObj.title}`,
                            content: `Title: ${linkObj.title}\nLink: ${linkObj.url}\nSource: IRDAI`,
                            sourceUrl: linkObj.url,
                            metadata: {
                                category: this.category,
                                sourceType: DataSourceTypeEnum.SCRAPED,
                                siteName: "IRDAI",
                                source: "IRDAI Official",
                                name: linkObj.title
                            }
                        });
                    }
                } catch (e) {
                    console.warn(`Failed to process IRDAI link ${linkObj.url}: ${e.message}`);
                    results.push({
                        title: `IRDAI Link (Failed Parse): ${linkObj.title}`,
                        content: `Title: ${linkObj.title}\nLink: ${linkObj.url}\nError: ${e.message}\nSource: IRDAI`,
                        sourceUrl: linkObj.url,
                        metadata: {
                            category: this.category,
                            sourceType: DataSourceTypeEnum.REFERENCE,
                            siteName: "IRDAI",
                            source: "IRDAI",
                            name: linkObj.title
                        }
                    });
                }
            }

            if (results.length === 0) {
                // Fallback
                results.push({
                    title: "IRDAI Circulars Page",
                    content: "Please visit the IRDAI circulars page for latest updates.",
                    sourceUrl: this.baseUrl,
                    metadata: {
                        category: this.category,
                        sourceType: DataSourceTypeEnum.REFERENCE,
                        siteName: "IRDAI",
                        source: "IRDAI",
                        name: "Circulars Index"
                    }
                });
            }

            this.log(`Processed ${results.length} IRDAI documents.`);
            return results;
        } catch (error) {
            this.error("Failed to scrape IRDAI", error);
            return [];
        }
    }
}

export const scrapeIrdaiCirculars = async () => {
    const scraper = new IrdaiScraper();
    return scraper.scrape();
};
