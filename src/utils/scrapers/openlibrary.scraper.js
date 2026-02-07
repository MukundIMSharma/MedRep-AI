import axios from "axios";
import { BaseScraper } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

// OpenLibrary Search API
const OPENLIBRARY_API_URL = "https://openlibrary.org/search.json";

export class OpenLibraryScraper extends BaseScraper {
    constructor() {
        super("OpenLibrary", OPENLIBRARY_API_URL, DocumentCategoryEnum.BOOK);
    }

    async scrape() {
        this.log("Starting API fetch...");
        try {
            // Search for medical textbooks
            const response = await axios.get(this.baseUrl, {
                params: {
                    q: "medical pharmacology india", // Targeting relevant medical books
                    limit: 5,
                    fields: "title,author_name,first_publish_year,key,cover_i"
                }
            });

            const docs = response.data.docs || [];
            const results = [];

            for (const doc of docs) {
                const title = doc.title;
                const authors = doc.author_name ? doc.author_name.join(", ") : "Unknown Author";
                const year = doc.first_publish_year;
                const bookKey = doc.key; // e.g. /works/OL12345W
                const sourceUrl = `https://openlibrary.org${bookKey}`;

                results.push({
                    title: `Medical Book: ${title}`,
                    content: `Title: ${title}\nAuthors: ${authors}\nFirst Published: ${year}\nLink: ${sourceUrl}\nSource: OpenLibrary`,
                    sourceUrl: sourceUrl,
                    metadata: {
                        category: this.category,
                        sourceType: DataSourceTypeEnum.API,
                        siteName: "OpenLibrary",
                        source: "OpenLibrary / Internet Archive",
                        name: title,
                        bookId: bookKey
                    }
                });
            }

            this.log(`Found ${results.length} medical books.`);
            return results;

        } catch (error) {
            this.error("Failed to fetch from OpenLibrary API", error);
            return [];
        }
    }
}

export const scrapeMedicalBooks = async () => {
    const scraper = new OpenLibraryScraper();
    return scraper.scrape();
};
