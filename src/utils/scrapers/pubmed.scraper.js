import axios from "axios";
import { BaseScraper } from "../scraper.utils.js";
import { DocumentCategoryEnum, DataSourceTypeEnum } from "../constants.js";

// PubMed E-utilities API
const PUBMED_API_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi";
const PUBMED_SUMMARY_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi";

export class PubmedScraper extends BaseScraper {
    constructor() {
        super("PubMed", PUBMED_API_URL, DocumentCategoryEnum.RESEARCH);
    }

    async scrape() {
        this.log("Starting API fetch...");
        try {
            // 1. Search for recent papers - broadened query to ensure results
            const searchParams = {
                db: "pubmed",
                term: "public health india[Title/Abstract]", // Removed 'open access' filter which might be too strict for simple metadata scraping
                retmode: "json",
                retmax: 5,
                sort: "date"
            };

            const searchRes = await axios.get(this.baseUrl, { params: searchParams });
            const ids = searchRes.data.esearchresult?.idlist;

            if (!ids || ids.length === 0) {
                this.log("No papers found.");
                return [];
            }

            // 2. Fetch summaries for the found IDs
            const summaryParams = {
                db: "pubmed",
                id: ids.join(","),
                retmode: "json"
            };

            const summaryRes = await axios.get(PUBMED_SUMMARY_URL, { params: summaryParams });
            const summaries = summaryRes.data.result;
            const results = [];

            for (const id of ids) {
                const doc = summaries[id];
                if (doc) {
                    const title = doc.title;
                    const journal = doc.source;
                    const pubDate = doc.pubdate;
                    const pmcId = doc.articleids.find(a => a.idtype === "pmc")?.value;
                    const sourceUrl = pmcId ? `https://www.ncbi.nlm.nih.gov/pmc/articles/${pmcId}/` : `https://pubmed.ncbi.nlm.nih.gov/${id}/`;

                    results.push({
                        title: `Research Paper: ${title}`,
                        content: `Title: ${title}\nJournal: ${journal}\nPublished: ${pubDate}\nID: PMID:${id}\nLink: ${sourceUrl}\nSource: PubMed Central`,
                        sourceUrl: sourceUrl,
                        metadata: {
                            category: this.category,
                            sourceType: DataSourceTypeEnum.API,
                            siteName: "PubMed",
                            source: "National Center for Biotechnology Information (NCBI)",
                            name: title,
                            paperId: id
                        }
                    });
                }
            }

            this.log(`Found ${results.length} research papers.`);
            return results;

        } catch (error) {
            this.error("Failed to fetch from PubMed API", error);
            return [];
        }
    }
}

export const scrapePubmedPapers = async () => {
    const scraper = new PubmedScraper();
    return scraper.scrape();
};
